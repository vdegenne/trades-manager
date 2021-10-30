import { css } from 'lit';

export const globalStyles = css`
.anchor {
  color: #2196f3;
  cursor: pointer;
}
.anchor[disabled] {
  color: grey;
  cursor: not-allowed
}
`