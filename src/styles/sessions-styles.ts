import { css } from 'lit';

export default css`
.session {
  display: flex;
  flex: 1;
  align-items: center;
  padding: 11px;
  background-color: var(--card-color);
  color: var(--main-text-color);
  justify-content: space-between;
  margin: 8px 0;
  /*border-radius: 5px;*/
  border-radius: 2px;
  line-height: normal;
  /* box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.1), 0px 2px 2px 0px rgba(0, 0, 0, 0.08), 0px 1px 5px 0px rgba(0, 0, 0, 0.06); */
  /* box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25); */
  /* box-shadow: rgb(0 0 0 / 20%) 0px 1px 4px -1px; */
  box-shadow: rgb(0 0 0 / 20%) 0px 35px 15px -29px;
  position: relative;
}
.title {
  background-color: var(--on-background-color);
  color: var(--main-text-color);
  font-size:0.9em;
}
.session[entitled] {
  margin-top: 30px;
  border-radius: 0 0 2px 2px;
}
.session[eventful] {
  cursor: pointer;
  transition: background-color .2s linear;
}
.session[eventful]:hover {
  background-color: var(--card-hover-color);
  /* background-color: #fff3e0; */
  /* background-color: #f5f5f5; */
}
.session[eventful]:hover .title {
  background-color: var(--card-hover-color)
  /* background-color: #f5f5f5; */
}
.session[eventful]:hover .price {
  /* color: black */
}
.session[eventful]:hover .name mwc-icon {
  /* color: black; */
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
  left: 0; right: 0;
  top: -19px;
  /* right: 0; */
  /* left: 21px; */
  padding: 1px 9px;
  background-color: var(--on-background-color);
  /* border: 1px solid var(--on-background-color);*/
  color: var(--main-text-color);
  border-radius: 5px 5px 0 0;
  z-index: -1;
  transition: background-color .2s linear;
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