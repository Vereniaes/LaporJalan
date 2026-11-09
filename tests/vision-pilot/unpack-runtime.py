# Unpack the verified pilot runtime without installing system packages.
# Todo:
# -> use the existing zstd shared library and reject unsafe archive paths
import ctypes
import ctypes.util
import json
from pathlib import Path
import tarfile
import hashlib

pilot = Path(__file__).resolve().parents[2] / 'knowledge/crm-3d-plan-2026-10-28/implementation-p5'
root = pilot / 'runs/runtime/artifacts'
archive = root / 'ollama-0.40.12-linux-amd64.tar.zst'
expected = 'f8adcb7e08d272283a4bd3abc18cf581afe37e64b2aee04fda4f407f215485ba'
sha = hashlib.sha256()
with archive.open('rb') as source:
    for block in iter(lambda: source.read(4 * 1024 * 1024), b''):
        sha.update(block)
if sha.hexdigest() != expected:
    raise ValueError('Runtime archive checksum mismatch')

class Buffer(ctypes.Structure):
    _fields_ = [('data', ctypes.c_void_p), ('size', ctypes.c_size_t), ('pos', ctypes.c_size_t)]

lib = ctypes.CDLL(ctypes.util.find_library('zstd'))
lib.ZSTD_createDStream.restype = ctypes.c_void_p
lib.ZSTD_initDStream.argtypes = [ctypes.c_void_p]
lib.ZSTD_initDStream.restype = ctypes.c_size_t
lib.ZSTD_decompressStream.argtypes = [ctypes.c_void_p, ctypes.POINTER(Buffer), ctypes.POINTER(Buffer)]
lib.ZSTD_decompressStream.restype = ctypes.c_size_t
lib.ZSTD_isError.argtypes = [ctypes.c_size_t]
lib.ZSTD_isError.restype = ctypes.c_uint
lib.ZSTD_freeDStream.argtypes = [ctypes.c_void_p]
stream = lib.ZSTD_createDStream()
if not stream or lib.ZSTD_isError(lib.ZSTD_initDStream(stream)):
    raise RuntimeError('zstd initialization failed')
tar_path = root / 'ollama-0.40.12-linux-amd64.tar'
last = 1
try:
    with archive.open('rb') as source, tar_path.open('xb') as target:
        while True:
            block = source.read(4 * 1024 * 1024)
            if not block:
                break
            data = ctypes.create_string_buffer(block)
            incoming = Buffer(ctypes.cast(data, ctypes.c_void_p), len(block), 0)
            while incoming.pos < incoming.size:
                output = ctypes.create_string_buffer(1024 * 1024)
                outgoing = Buffer(ctypes.cast(output, ctypes.c_void_p), len(output), 0)
                last = lib.ZSTD_decompressStream(stream, ctypes.byref(outgoing), ctypes.byref(incoming))
                if lib.ZSTD_isError(last):
                    raise RuntimeError('zstd decompression failed')
                target.write(output.raw[:outgoing.pos])
                if target.tell() > 16 * 1024 ** 3:
                    raise ValueError('Runtime decompression size limit exceeded')
    if last != 0:
        raise ValueError('Incomplete zstd archive')
finally:
    lib.ZSTD_freeDStream(stream)

destination = root / 'ollama-0.40.12'
destination.mkdir()
with tarfile.open(tar_path) as tar:
    members = tar.getmembers()
    for member in members:
        name = Path(member.name)
        if name.is_absolute() or '..' in name.parts or not (member.isfile() or member.isdir() or member.issym() or member.islnk()):
            raise ValueError('Unsafe runtime archive member')
        if member.issym() or member.islnk():
            link = Path(member.linkname)
            target = (destination / name.parent / link).resolve() if member.issym() else (destination / link).resolve()
            if link.is_absolute() or not target.is_relative_to(destination.resolve()):
                raise ValueError('Unsafe runtime archive link')
    tar.extractall(destination, members=members)
(pilot / 'evidence/runtime-extraction.json').write_text(json.dumps({'status': 'completed', 'archiveSha256': expected, 'entries': len(members), 'destination': str(destination), 'method': 'Existing libzstd, validated paths, no system package installation'}, indent=2))
print('Runtime extracted:', destination)
