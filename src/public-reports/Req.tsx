/* Todo:
-> mark a required field with a red asterisk beside its label (owner, 10 Nov: no "(wajib ...)" words)
    -> the asterisk is CSS content with empty alt text: it stays out of the label's text and accessible name; the field itself says required
*/
export const Req = () => <span className="lj-req" />;
// an inline error under a field; id is what the field's aria-describedby points to
export const FieldError = ({ id, message }: { id: string; message?: string }) => message ? <p className="lj-field-error" id={id}>{message}</p> : null;
