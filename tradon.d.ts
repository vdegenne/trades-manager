import * as lit_element from 'lit-element';
import { LitElement, TemplateResult } from 'lit-element';
import { Dialog } from '@material/mwc-dialog';
import { Snackbar } from '@material/mwc-snackbar';
import { Radio } from '@material/mwc-radio';
import { TextField } from '@material/mwc-textfield';
import { Checkbox } from '@material/mwc-checkbox';
import { TextArea } from '@material/mwc-textarea';

declare class ConfirmDialog extends LitElement {
    dialog: Dialog;
    private label;
    private message;
    private alert;
    private promiseResolve;
    private promiseReject;
    static styles: lit_element.CSSResult[];
    render(): TemplateResult;
    open(label: string, message: string | TemplateResult, alert?: boolean): Promise<unknown>;
}

declare type Pair = {
    symbol: string;
    quote: string;
    price?: number;
};
interface PairsManagerInterface {
    isPairAvailable(symbol: string, quote: string): boolean;
    updateFunction(): void;
    getAvailableSymbols(): string[];
    getAvailableQuotesFromSymbol(symbol: string): string[];
}
declare class PairsManager implements PairsManagerInterface {
    protected pairs: Pair[];
    protected updateTimeout?: NodeJS.Timeout;
    protected timeoutMs: number;
    constructor(pairs?: Pair[]);
    /**
     * pairExists will check if the pair exists in the pairs list, hence
     * if it was registered.
     * Also check for `isPairAvailable` to understand the subtle difference.
     */
    pairExists(symbol: string, quote: string): boolean;
    /**
     * isPairAvailable will check if the pair exists in the whole exchange
     * and then if it is available for registration
     */
    isPairAvailable(symbol: string, quote: string): boolean;
    getPair(symbol: string, quote: string): Pair | undefined;
    addPair(symbol: string, quote: string, updatePairs?: boolean): Promise<boolean>;
    updatePairs(): Promise<void>;
    /**
     * This function will fetch information from coingecko to update the data structure (price)
     * It calls itself automatically every 30s unless it's explicitly called, in which case
     * it will trigger code execution and reset the timer
     */
    updateFunction(): Promise<void>;
    getAvailableSymbols(): string[];
    getAvailableQuotesFromSymbol(symbol: string): string[];
    getPrice(symbol: string, quote: string): number | undefined;
}

declare type Trade = {
    type: 'buy' | 'sell';
    price: number;
    volume: number;
    fees?: number;
};
declare type TradeSession = {
    id: number;
    title?: string;
    exchange: AvailableExchanges;
    symbol: string;
    quote: string;
    trades: Trade[];
    virtual: boolean;
};
declare type TradesSummary = {
    invested: number;
    volume: number;
};
declare global {
    interface Window {
        tradesManager: TradesManager;
        sessions: TradeSession[];
    }
}
declare class TradesManager {
    sessions: TradeSession[];
    constructor(tradeSessions?: TradeSession[]);
    createSession(exchange: AvailableExchanges, symbol: string, quote: string, virtual?: boolean, title?: string): TradeSession;
    addTrade(session: TradeSession, trade: Trade): void;
    deleteSession(session: TradeSession): void;
    cloneSession(session: TradeSession): TradeSession;
    deleteTrade(trade: Trade): boolean;
    getTradesSession(trade: Trade): TradeSession | undefined;
    getSessions(exchangeName: string, symbol: string, quote: string): TradeSession[];
    getSessionFromId(id: number): TradeSession | undefined;
    getPairTrades(pair: string): any;
    getSummarizedSessionTrades(session: TradeSession): TradesSummary;
    toString(): string;
}

declare type Exchange = PairsManager;
declare type Exchanges = {
    [key in 'kraken' | 'binance' | 'others']: Exchange;
};
declare type AvailableExchanges = keyof Exchanges;
declare class ExchangesManager {
    static exchanges: Exchanges;
    static getAvailableExchanges(): ("kraken" | "binance" | "others")[];
    static getAvailableSymbols(exchangeName: string): string[];
    static getAvailableQuotesFromSymbol(exchangeName: string, symbol: string): any;
    static initializeExchangesFromSessions(sessions: TradeSession[]): void;
    static startUpdateRoutines(): void;
    static pairExists(symbol: string, quote: string): boolean;
    static getPrice(exchangeName: AvailableExchanges, symbol: string, quote: string): number | undefined;
    static addPair(exchangeName: AvailableExchanges, symbol: string, quote: string, updatePairs?: boolean): Promise<void>;
    static registerQuoteForConversion(quote: string, preferredExchange?: AvailableExchanges): void;
    static getConversionPrice(symbol: string, preferredQuote: string, preferredExchange?: AvailableExchanges): {
        quote: string;
        price: number;
    } | {
        quote: undefined;
        price: undefined;
    };
}
declare global {
    interface Window {
        exchangesManager: ExchangesManager;
    }
}

declare type Space = {
    name: string;
    currency: Currency;
    sessions: TradeSession[];
};
declare global {
    interface Window {
        spacesManager: SpacesManager;
        spaces: () => Space[];
    }
}
declare class SpacesManager extends LitElement {
    spaces: Space[];
    space: Space;
    private currency?;
    currencyDialog: Dialog;
    constructor();
    render(): lit_element.TemplateResult;
    firstUpdated(): Promise<void>;
    loadSpaces(spaces: Space[]): void;
    loadSpace(space: Space): void;
    createSpace(name: string): Promise<Space>;
    private createDefaultSpace;
    private getDefaultSpace;
    private askCurrencyResolve;
    private askCurrency;
    save(): void;
    toString(): string;
}

declare class TextDialog extends LitElement {
    private heading?;
    private message?;
    private buttonTitle;
    private resolveFunction;
    dialog: Dialog;
    render(): TemplateResult;
    open(heading: string, message: string | TemplateResult, buttonTitle?: string): Promise<unknown>;
}

declare class TCodeInterface extends LitElement {
    private validity;
    private sessions;
    private lockSessions;
    dialog: Dialog;
    textfield: TextField;
    checkedSession: Radio;
    static styles: lit_element.CSSResult[];
    render(): lit_element.TemplateResult;
    firstUpdated(): void;
    private onTextFieldKeypress;
    private submit;
    reportValidity(message: string): void;
    open(session?: TradeSession): void;
    reset(): void;
}

declare class AboutDialog extends LitElement {
    dialog: Dialog;
    render(): lit_element.TemplateResult;
    open(): void;
}

declare type Options = {
    sessionViewOptions: SessionViewOptions;
    exchangeViewOptions: {
        showWallet: boolean;
        showVirtual: boolean;
    };
};
declare type SessionViewOptions = {
    events: boolean;
    showPrice: boolean;
    showSourceProfit: boolean;
    showTotalValue: boolean;
    showPercent: boolean;
    showCross: boolean;
};
declare class OptionsManager {
    options: Options;
    constructor(options?: Options);
    loadOptions(options: Options): void;
    get default(): Options;
    save(): void;
}
declare global {
    interface Window {
        optionsManager: OptionsManager;
        options: Options;
    }
}

declare class SessionsView extends LitElement {
    private profitAggregator;
    private totalValueAggregator;
    private walletAggregator;
    constructor();
    static styles: lit_element.CSSResult[];
    render(): lit_element.TemplateResult;
    sessionTemplate(session: TradeSession, external?: boolean, viewOptions?: Partial<SessionViewOptions>): lit_element.TemplateResult;
    sessionExternalTemplate(session: TradeSession, viewOptions?: Partial<SessionViewOptions>): lit_element.TemplateResult;
    private onSessionElementClick;
}
declare global {
    interface Window {
        sessionsView: SessionsView;
    }
}

declare class SessionCreateDialog extends LitElement {
    private exchange?;
    private symbol?;
    private quote?;
    dialog: Dialog;
    virtualCheckbox: Checkbox;
    titleTextfield: TextField;
    static styles: lit_element.CSSResult;
    render(): lit_element.TemplateResult;
    fixOverflow(): void;
    submit(): void;
    onSymbolSelectChange(e: any): void;
    randomize(): Promise<void>;
    open(exchangeName: AvailableExchanges): void;
}

declare global {
    interface Window {
        tradeCreateDialog: TradeCreateDialog;
    }
}
declare class TradeCreateDialog extends LitElement {
    private session;
    private type;
    private price;
    private quantity;
    private maxQuantity?;
    private fees;
    priceField: TextField;
    quantityField: TextField;
    feesField: TextField;
    constructor();
    dialog: Dialog;
    static styles: lit_element.CSSResult;
    render(): lit_element.TemplateResult;
    private getStep;
    private updatePrice;
    private insertLastPrice;
    private updateQuantity;
    private insertAvailableVolume;
    private onAddButtonClick;
    open(session: TradeSession): void;
    private reset;
}

declare class tradesInterface extends LitElement {
    private session?;
    dialog: Dialog;
    createDialog: SessionCreateDialog;
    createTradeDialog: TradeCreateDialog;
    static styles: lit_element.CSSResult;
    constructor();
    render(): lit_element.TemplateResult;
    tradeTemplate(trade: Trade, session: TradeSession, eventful?: boolean): lit_element.TemplateResult;
    private oncloneSessionClick;
    private onVirtualChange;
    openSession(session: TradeSession): void;
    deleteTrade(trade: Trade): Promise<void>;
    /**
     * This function throws an error on cancel, make sure you catch the error in scripts calling it.
     */
    addTrade(session: TradeSession, trade: Trade): Promise<void>;
}
declare global {
    interface Window {
        tradesInterface: tradesInterface;
    }
}

declare class SessionsInterface extends LitElement {
    tradesManager: TradesManager;
    tradesInterface: tradesInterface;
    sessionsView: SessionsView;
    private formType;
    private session?;
    private trade?;
    private exchange?;
    private symbol?;
    private quote?;
    private price?;
    private volume?;
    tradeDialog: Dialog;
    constructor();
    loadSessions(sessions: TradeSession[]): void;
    static styles: lit_element.CSSResult[];
    render(): lit_element.TemplateResult;
    createSession(exchangeName: AvailableExchanges, symbol: string, quote: string, virtual?: boolean, title?: string): TradeSession;
    cloneSession(session: TradeSession): Promise<void>;
    deleteSession(session: TradeSession): Promise<void>;
    private refreshTimeout?;
    refreshUI(): void;
}
declare global {
    interface Window {
        sessionsInterface: SessionsInterface;
    }
}

declare class ImportExport extends LitElement {
    private type;
    dialog: Dialog;
    exportTextArea: TextArea;
    importTextArea: TextArea;
    static styles: lit_element.CSSResult[];
    render(): lit_element.TemplateResult;
    private onImportClick;
    private copyToClipboard;
    open(): void;
}

declare type AppData = {
    spaces: Space[];
    options: Options;
};
declare class DataLoader {
    getCurrentState(): AppData;
    verifyIntegrity(object: AppData): void;
    loadData(data: AppData, save?: boolean): void;
}
declare global {
    interface Window {
        dataLoader: DataLoader;
    }
}

declare global {
    interface Window {
        app: AppContainer;
        appTitle: string;
        textDialog: TextDialog;
        confirmDialog: ConfirmDialog;
        tcodeInterface: TCodeInterface;
        importExportInterface: ImportExport;
    }
}
declare const Currencies: readonly ["EUR", "USD"];
declare type Currency = typeof Currencies[number];
declare class AppContainer extends LitElement {
    spacesManager: SpacesManager;
    sessionsInterface: SessionsInterface;
    private tCodeInterface;
    private optionsInterface;
    private importExport;
    private confirmDialog;
    private walletsManager;
    private static;
    snackbar: Snackbar;
    optionsDialog: Dialog;
    textDialog: TextDialog;
    aboutDialog: AboutDialog;
    spacesInterface: any;
    constructor();
    /**
     * This function is used to determine if the website is in static mode or not.
     * static means the site is loaded from a static context (e.g. github)
     * whereas non-static is when the site is loaded from the server.
     * When the site is loaded from the server we should give more feature to the user ($)
     */
    private constructServerScript;
    static styles: lit_element.CSSResult;
    render(): lit_element.TemplateResult;
    private onSpaceButtonClick;
    firstUpdated(): void;
    toast(message: string): void;
}

export { Currencies, Currency };
