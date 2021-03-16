import { customElement, LitElement, html, css, property, query } from 'lit-element';
import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-select';
import { Radio } from '@material/mwc-radio';
import '@material/mwc-formfield';
import '@material/mwc-textfield';
import { nothing } from 'lit-html';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

class TradeManager {
    constructor(trades) {
        this.trades = trades || {};
    }
    addTrade(asset, trade) {
        if (!(asset in this.trades)) {
            this.trades[asset] = [];
        }
        this.trades[asset].push(trade);
    }
    deleteAsset(assetName) {
        delete this.trades[assetName];
        console.log(this.trades);
    }
    get assets() {
        return Object.keys(this.trades);
    }
    getAssetTrades(assetName) {
        return this.trades[assetName];
    }
    getSummarizedTrade(assetName) {
        if (!(assetName in this.trades)) {
            return undefined;
        }
        return summarizeTrades(this.trades[assetName]);
    }
    toString() {
        return JSON.stringify(this.trades);
    }
}
// export function getTradesFromKrakenTradeObjects (tradeObjects: KrakenTradeObject[]) {
//   // const tradeObjects: KrakenTradeObject[] = krakenResponse.result.trades;
//   console.log(`number of trades: ${Object.keys(tradeObjects).length}`);
//   console.log(Object.values(tradeObjects).filter(o => o.pair === 'GNOEUR'));
//   const trades: Trades = {}
//   for (const o of Object.values<KrakenTradeObject>(tradeObjects)) {
//     let trade = trades[o.pair] ;
//     if (!trade) {
//       trade = trades[o.pair] = []
//     }
//     trade.push({
//       t: o.type === 'sell' ? 's': 'b',
//       v: parseFloat(o.vol),
//       p: parseFloat(o.price),
//       f: parseFloat(o.fee),
//       c: parseFloat(o.cost)
//     })
//   }
//   return trades
// }
function summarizeTrades(trades) {
    return trades.reduce((acc, trade) => {
        if (trade.type === 'buy') {
            acc.profit -= trade.price * trade.volume;
            acc.volume += trade.volume;
        }
        else {
            acc.profit += trade.price * trade.volume;
            acc.volume -= trade.volume;
        }
        return acc;
    }, {
        profit: 0,
        volume: 0
    });
}
// export function reduceTrades(trades: Trades) {
//   return Object.fromEntries(
//     Object.entries(trades).map(([pair, units]) => {
//       return [pair, summarizeTradeUnits(units)]
//     })
//   )
// }

function round(value, precision = 2) {
    return Math.round(value * (10 ** precision)) / (10 ** precision);
}
function openCryptowatchLink(cryptoName) {
    window.open(`https://cryptowat.ch/charts/KRAKEN:${cryptoName}-EUR`, '_blank');
}

let TradesView = class TradesView extends LitElement {
    constructor(tradeManager) {
        super();
        this.trades = tradeManager || new TradeManager();
    }
    render() {
        return html `
    ${this.trades.assets.map(asset => {
            return this.assetTemplate(asset);
        })}
    `;
    }
    assetTemplate(assetName) {
        const summary = this.trades.getSummarizedTrade(assetName);
        const activeProfit = window.app.cryptos.find(c => c.name === assetName).getLastPrice() * summary.volume;
        const overallProfit = round(summary.profit + activeProfit);
        return html `
    <div class="asset"
        @mousedown="${(e) => { if (e.button === 2)
            openCryptowatchLink(assetName); }}">
      <span class="name">${assetName}</span>
      <span class="profit"
        style="font-weight:500;color:${overallProfit === 0 ? 'initial' : (overallProfit > 0 ? 'green' : 'red')}">${overallProfit}€</span>
      <mwc-icon-button icon="close"
        @click="${() => this.deleteAsset(assetName)}"></mwc-icon-button>
    </div>
    <style>
      .asset {
        display: flex;
        align-items: center;
        padding: 0 0 0 14px;
        background-color: #eeeeee;
        justify-content: space-between;
        margin: 1px 0;
      }
      .asset > .name {
        font-size: 16px;
        font-weight: 500;
        width: 60px;
        text-align: left
      }
    </style>
    `;
    }
    deleteAsset(assetName) {
        const accept = window.confirm('Are you sure ?');
        if (accept) {
            this.trades.deleteAsset(assetName);
            this.requestUpdate();
            window.app.toast('asset deleted');
            this.saveTrades();
        }
    }
    saveTrades() {
        localStorage.setItem('trades', this.trades.toString());
    }
};
TradesView = __decorate([
    customElement('trades-view')
], TradesView);

let TradesInterface = class TradesInterface extends LitElement {
    constructor() {
        super();
        this.trades = new TradeManager(localStorage.getItem('trades') ? JSON.parse(localStorage.getItem('trades')) : {});
        this.tradesView = new TradesView(this.trades);
    }
    render() {
        this.tradesView.requestUpdate();
        return html `
    <div style="text-align:center">
      ${!this.trades.assets.length ? html `<div style="font-size:18px;margin:18px 0">no trades yet</div>` : nothing}
      ${this.tradesView}
      <mwc-button 
        style="margin-top:20px"
        @click="${() => this.openTransactionDialog()}" raised icon="add">add</mwc-button>
    </div>



    <mwc-dialog id="transaction" heading="Transaction"
        @opened="${this.fixOverflow}">
      <form>
        <div style="width:350px"></div>
        <p>Asset</p>
        <mwc-select name="asset" style="width:100%" required
            fixedMenuPosition
            @selected="${(e) => this.onAssetSelection(e)}">
          <mwc-list-item></mwc-list-item>
          ${window.app.cryptos.map(crypto => {
            return html `<mwc-list-item
              ?selected="${crypto.name === this.asset}"
              value="${crypto.name}">${crypto.name}</mwc-list-item>`;
        })}
        </mwc-select>

        <p>Type</p>
        <mwc-formfield label="buy" style="--mdc-theme-text-primary-on-background:green">
          <mwc-radio name="type" value="buy" checked></mwc-radio>
        </mwc-formfield>
        <mwc-formfield label="sell" style="--mdc-theme-text-primary-on-background:red"
            @click="${this.updateFormCoherence}">
          <mwc-radio name="type" value="sell"></mwc-radio>
        </mwc-formfield>

        <p>Price</p>
        <mwc-textfield outlined required
          name="price"></mwc-textfield>

        <p>Volume</p>
        <mwc-textfield outlined required
          name="volume"></mwc-textfield>
      </form>

      <mwc-button unelevated slot="secondaryAction"
        @click="${this.submit}">trade</mwc-button>
      <mwc-button slot="primaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>`;
    }
    fixOverflow() {
        this.transactionDialog.shadowRoot.querySelector('.mdc-dialog__surface').style.overflowY = 'visible';
        this.transactionDialog.shadowRoot.querySelector('.mdc-dialog__content').style.overflow = 'visible';
    }
    getType() {
        return this.shadowRoot.querySelector('[name=type][checked]').value;
    }
    onAssetSelection(e) {
        try {
            this.getEl('price').setCustomValidity('');
            this.getEl('price').value = window.app.cryptos.find(c => c.name === e.target.value).getLastPrice().toString();
            this.updateFormCoherence();
        }
        catch (e) {
            // console.log(e)
        }
    }
    async updateFormCoherence() {
        const summary = this.trades.getSummarizedTrade(this.getEl('asset').value);
        this.shadowRoot.querySelector('[name=type][value=sell]').disabled = !summary || summary.volume === 0;
        if (!summary) {
            this.shadowRoot.querySelector('[name=type][value=buy]').checked = true;
        }
        else {
            await new Promise(resolve => setTimeout(resolve, 200));
            if (this.getType() === 'sell') {
                this.getEl('volume').value = summary.volume.toString();
            }
        }
    }
    deleteAsset(assetName) {
        const accept = window.confirm('Are you sure ?');
        if (accept) {
            this.trades.deleteAsset(assetName);
            this.requestUpdate();
            window.app.toast('asset deleted');
            this.saveTrades();
        }
    }
    getEl(name) {
        const el = this.shadowRoot.querySelectorAll(`[name=${name}]`);
        if (el.length === 1) {
            return el[0];
        }
        // else it's radio
        return [...el].find(el => el.checked);
    }
    getFormElements() {
        return [...this.shadowRoot.querySelectorAll('[name]')].filter(el => {
            return (!(el instanceof Radio) || el.checked);
        });
    }
    submit() {
        const formElements = this.getFormElements();
        for (const el of formElements) {
            if (el instanceof Radio)
                continue;
            if (el.getAttribute('name') === 'volume' || el.getAttribute('name') === 'price') {
                el.setCustomValidity('');
                el.reportValidity();
                if (isNaN(parseFloat(el.value))) {
                    el.setCustomValidity('invalid value');
                    el.reportValidity();
                    return;
                }
            }
            if (!el.checkValidity()) {
                el.reportValidity();
                return;
            }
        }
        const transac = Object.fromEntries(formElements.map(el => {
            return [el.getAttribute('name'), el.value];
        }));
        // we make sure we can't sell more than we have
        if (this.getType() === 'sell') {
            const summary = this.trades.getSummarizedTrade(this.getEl('asset').value);
            if (parseFloat(transac.volume) > summary.volume) {
                window.app.toast('not enough volume !');
                this.getEl('volume').setCustomValidity(`not enought volume (max: ${summary.volume})`);
                this.getEl('volume').reportValidity();
                return;
            }
        }
        this.trades.addTrade(transac.asset, {
            type: transac.type,
            price: parseFloat(transac.price),
            volume: parseFloat(transac.volume)
        });
        // this.transactionDialog.close()
        this.reset();
        window.app.toast('trade added');
        this.requestUpdate();
        this.transactionDialog.close();
        if (!this.dialog.open) {
            this.show();
        }
        this.saveTrades();
    }
    saveTrades() {
        localStorage.setItem('trades', this.trades.toString());
    }
    show() {
        this.dialog.show();
    }
    openTransactionDialog(asset, price) {
        this.reset();
        if (asset) {
            this.getEl('asset').value = asset;
        }
        if (price) {
            this.getEl('price').value = price.toString();
        }
        this.transactionDialog.show();
    }
    reset() {
        for (const el of this.getFormElements()) {
            if (el instanceof Radio)
                continue;
            el.value = '';
        }
    }
};
TradesInterface.styles = css `
  p {
    margin: 20px 0 4px 0;
  }
  `;
__decorate([
    property({ type: Object })
], TradesInterface.prototype, "trades", void 0);
__decorate([
    property()
], TradesInterface.prototype, "asset", void 0);
__decorate([
    query('mwc-dialog')
], TradesInterface.prototype, "dialog", void 0);
__decorate([
    query('mwc-dialog[heading=Transaction]')
], TradesInterface.prototype, "transactionDialog", void 0);
TradesInterface = __decorate([
    customElement('trades-interface')
], TradesInterface);

let AppContainer = class AppContainer extends LitElement {
    constructor() {
        super();
        window.app = this;
        this.tradesInterface = new TradesInterface();
    }
    render() {
        return html `

    ${this.tradesInterface}
    `;
    }
};
AppContainer = __decorate([
    customElement('app-container')
], AppContainer);
