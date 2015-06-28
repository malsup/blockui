//downloaded from http://malsup.com/jquery/block/#faq  26/Jun/2015

/// <reference path="../jquery/jquery.d.ts" />


interface JQueryStatic {
    // global $ methods for blocking/unblocking the entire page
    blockUI: BlockUI;
    unblockUI(property?: blockUIOptions);

    // convenience method for quick growl-like notifications  (http://www.google.com/search?q=growl)
    growlUI(title: string, message: string, timeout: number, onClose: () => void);
}
interface JQuery {
    // plugin method for blocking element content
    block: (options: blockUIOptions) => JQuery;
    // plugin method for unblocking element content
    unblock: (options: blockUIOptions) => JQuery;
}

//Css Properties
//BlockUI feeds css object to $('<div class="blockUI ...').css(properties: Object)
// any css property is valid, none are required. Cant use CSSStyleDeclaration, it requires all properties!

interface BlockUI {
    (property?: blockUIOptions);
    version: string;
    defaults: blockUIOptions;
}


interface blockUIOptions {
    message?: string | HTMLElement | JQuery;
    title?: string;
    draggable?: boolean;
    theme?: boolean;
    css?: any;
    themedCSS?: any;
    overlayCSS?: any;
    cursorReset?: string;
    growlCSS?: any;
    iframeSrc?: string;
    forceIframe?: boolean;
    baseZ?: number;
    centerX?: boolean;
    centerY?: boolean;
    allowBodyStretch?: boolean;
    bindEvents?: boolean;
    constraainTabKey?: boolean;
    fadeIn?: number;
    fadeOut?: number;
    timeout?: number;
    showOverlay?: boolean;
    focusInput?: boolean;           //new
    focusableElements?: boolean;    //new
    onBlock?: () => void;
    onUnblock?: (unblockElement: JQuery, options: blockUIOptions) => void ;
    onOverlayClick?: (JQueryEventObject: any) => void;                        //new
    quirksmodeOffsetHack?: number;
    blockMsgClass?: string;
    ignoreIfBlocked?: boolean;
}





