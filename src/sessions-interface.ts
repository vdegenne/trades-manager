import { css, customElement, html, LitElement, property, query } from "lit-element";
import '@material/mwc-dialog'
import '@material/mwc-button'
import { Trade, TradesManager, TradeSession } from "./TradesManager";
import { Dialog } from "@material/mwc-dialog";
import '@material/mwc-select'
import '@material/mwc-radio'
import '@material/mwc-formfield'
import '@material/mwc-textfield'
import '@material/mwc-tab-bar'
import { SessionsView } from "./sessions-view";
import { AvailableExchanges, ExchangesManager } from "./ExchangesManager";
import { sortAlphabetically } from "./util";
import './trades-interface'
import { tradesInterface } from "./trades-interface";
import sessionsStyles from "./styles/sessions-styles";

// type FormData = {
//   exchange: AvailableExchanges,
//   symbol: string;
//   quote: string;
//   type: 'buy'|'sell';
//   price: string;
//   volume: string;
//   fees: string;
// }


@customElement('sessions-interface')
export class SessionsInterface extends LitElement {
  public tradesManager!: TradesManager
  public tradesInterface: tradesInterface;
  public sessionsView: SessionsView;

  // @property()
  // private updating = false

  @property()
  private formType: 'form'|'text' = 'form';

  @property()
  private session?: TradeSession;
  @property()
  private trade?: Trade;

  @property()
  private exchange?: AvailableExchanges;
  @property()
  private symbol?: string;
  @property()
  private quote?: string;

  @property()
  private price?: string;
  @property()
  private volume?: string;


  // @property()
  // asset?: string;


  @query('mwc-dialog#trade') tradeDialog!: Dialog;

  constructor() {
    super()

    // we load an empty TradeManager upon startup
    // this.tradesManager = new TradeManager()

    // sessions interface
    this.tradesInterface = new tradesInterface();

    // trades view
    this.sessionsView = new SessionsView()

    window.sessionsInterface = this
  }

  loadSessions (sessions: TradeSession[]) {
    // creating the trade manager with local data if any
    this.tradesManager = new TradesManager(sessions)

    // then here we should update the different pairs manager
    ExchangesManager.initializeExchangesFromSessions(this.tradesManager.sessions)

    // start the loops to fetch the prices
    ExchangesManager.startUpdateRoutines()

    try { // trying to close the session interface dialog
      // this.tradesInterface.dialog.close()
    } catch (e) {}

    this.requestUpdate()
  }


  static styles = [
    css`
    p {
      margin: 20px 0 4px 0;
    }

    .form-content {
      height: 0;
      overflow: hidden;
    }

    [hide] {
      display:none;
    }

    [show] {
      height: initial;
      overflow: visible;
    }

    mwc-tab[active] {
      background-color: #eeeeee;
    }

    select {
      width: 100%;
      padding: 10px;
    }

    sup {
      color: red;
    }

    #inputs-box {
      text-align: right;
    }
    #inputs-box > mwc-textfield {
      min-width: 232px;
    }
  `]

  render () {
    this.sessionsView.requestUpdate()

    const exchanges = ExchangesManager.getAvailableExchanges()
    let symbols;
    let quotes;
    if (this.exchange) {
      symbols = sortAlphabetically(ExchangesManager.getAvailableSymbols(this.exchange))
      if (this.symbol) {
        quotes = sortAlphabetically(ExchangesManager.getAvailableQuotesFromSymbol(this.exchange, this.symbol))
      }
    }

    return html`
    ${this.sessionsView}

    ${this.tradesInterface}
    `
  }

  createSession (exchangeName: AvailableExchanges, symbol: string, quote: string, virtual = false) {
    const session = this.tradesManager.createSession(exchangeName, symbol, quote, virtual)
    this.requestUpdate()
    ExchangesManager.addPair(session.exchange, session.symbol, session.quote, false)
    ExchangesManager.exchanges[session.exchange].updatePairs()
    window.spacesManager.save()
    return session
  }

  async cloneSession (session: TradeSession) {
    await window.confirmDialog.open('Cloning Session', html`
      <p>You are about to clone this session :</p>
      ${window.sessionsView.sessionExternalTemplate(session, { events: false, showPrice: false, showSourceProfit: false })}
      <p>A cloned session will automatically be in virtual mode, you can click on the session strip and uncheck <i>virtual</i> anytime to make it active.</p>
      <p>A cloned session will also be inserted just below the original one in the list.</p>
      `, false)

    const cloned = this.tradesManager.cloneSession(session)
    cloned.virtual = true

    this.requestUpdate()

    window.spacesManager.save()
  }

  async deleteSession (session: TradeSession) {
    try {
      await window.confirmDialog.open('Deleting Session', html`The session and all the trades inside will be lost.<br>Are you sure to continue?`)
    } catch (e) {
      return // canceled
    }

    this.tradesManager.deleteSession(session)
    this.requestUpdate()
    try { // try to close the trades dialog if it is open
      window.tradesInterface.dialog.close()
    } catch (e) {}
    window.app.toast('session deleted')
    window.spacesManager.save()
  }

  private refreshTimeout?: NodeJS.Timeout;
  refreshUI () {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = undefined
    }

    this.refreshTimeout = setTimeout(() => this.requestUpdate(), 500)
  }
}


declare global {
  interface Window {
    sessionsInterface: SessionsInterface;
  }
}
