import { css } from 'lit';

export default css`
.session {
  display: flex;
  flex: 1;
  align-items: center;
  padding: 11px;
  /* background-color: #eeeeee; */
  background-color: black;
  color: white;
  justify-content: space-between;
  margin: 8px 0;
  border-radius: 5px;
  line-height: normal;
  /* box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.1), 0px 2px 2px 0px rgba(0, 0, 0, 0.08), 0px 1px 5px 0px rgba(0, 0, 0, 0.06); */
  /* box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25); */
  box-shadow: rgb(0 0 0 / 20%) 0px 1px 4px -1px;
  position: relative;
}
.session[entitled] {
  margin-top: 30px;
}
.session[eventful] {
  cursor: pointer;
  transition: background-color .2s linear;
}
.session[eventful]:hover {
  background-color: #eeeeee;
}
.session[external] {
  border: 2px solid #e0e0e0;
}
.session[virtual] {
  opacity: 0.4;
  box-shadow: none;
}
.session > .title {
  position: absolute;
  top: -21px;
  /* left: 21px; */
  padding: 1px 9px;
  background: black;
  border: 1px solid black;
  border-radius: 5px 5px 0 0;
  z-index: -1;
}
.session .name {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  /* width: 60px; */
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
  font-size: 14px;
  border-radius: 4px;
  padding: 5px 7px;
  opacity: 0.8;
}
`