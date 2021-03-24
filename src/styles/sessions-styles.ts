import { css } from "lit-element";

export default css`
.session {
  display: flex;
  flex: 1;
  align-items: center;
  padding: 11px;
  background-color: #eeeeee;
  justify-content: space-between;
  margin: 8px 0;
  border-radius: 5px;
  line-height: normal;
  /* box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.1), 0px 2px 2px 0px rgba(0, 0, 0, 0.08), 0px 1px 5px 0px rgba(0, 0, 0, 0.06); */
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25);
}
.session:hover {
  background-color: #eeeeee;
}
.session .name {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  width: 60px;
  text-align: left
}
.session .name > mwc-icon {
  margin: 0 5px;
  color: #bdbdbd;
}
.session .price {
  font-size: 12px;
  color: grey;
  margin: 4px 0 0;
}
.session > mwc-icon-button {
  --mdc-icon-size: 24px;
  --mdc-icon-button-size: 32px;
}

.session .total-value {
  font-size:14px;
  color:#3f51b5
}

.session .percent {
  color: white;
  border-radius: 4px;
  padding: 5px 7px;
  opacity: 0.8;
}
`