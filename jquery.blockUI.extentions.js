/*
blockUI plugin extentions for jquery
http://github.com/RobinHerbots/blockui
Copyright (c) 2010 Robin Herbots
Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
Version: 0.0.1
*/

(function($) {

    // convenience method for quick growl-like notifications  (http://www.google.com/search?q=growl)
    $.growlUI = function(title, message, timeout, onClose) {
        $.blockUI({
            message: message,
            title: title,
            timeout: timeout,
            onUnblock: onClose,
            messageBlockType: 'growl'
        });
    };


    //optional extentions on blockUI
    $.extend($.blockUI, {
        defaults: $.extend({}, {
            messageBlockType: 'default', //specify the type of the messageBlock. default or exception or growl or dialog (for the moment)
            source: null,
            exceptionId: null
        }, $.blockUI.defaults),

        _messageBlock: function(zindex, options) {
            switch (options.messageBlockType.toLowerCase()) {
                case 'exception':
                    $.extend(options, {
                        message: "<br/>" + options.message + "<br/><br/>",
                        buttons: { Ok: function() { $.unblockUI(); } },
                        theme: true,
                        themedCSS: {
                            overflow: 'auto',
                            width: 'auto'
                        },
                        msgContentCSS: {
                            overflow: 'hidden' //hide the unneeded scrollbars in ie7
                        },
                        closeOnEscape: true
                    });

                       var exceptionMessage = this.messageBlock(zindex, options);

                    if (options.stacktrace) {
                        var stackElement = $("<textarea rows='10' readonly='true' style='width:94%;padding:10px;'>" + options.stacktrace + "</textarea>").hide();
                        var stackTitle = $("<p class='ui-widget-content ui-dialog-content' style='text-decoration: underline;'>Stacktrace</p>").click(function() { stackElement.toggle(); center(exceptionMessage); });

                        exceptionMessage.append(stackTitle).append(stackElement);
                    }

                    return exceptionMessage;
                    break;
                case 'growl':
                    var $m = $('<div class="growlUI"></div>');
                    if (options.title) $m.append('<h1>' + options.title + '</h1>');
                    if (options.message) $m.append('<h2>' + options.message + '</h2>');
                    if (!options.timeout || options.timeout == 0) options.timeout = 3000;
                    $.extend(options, {
                        message: $m,
                        title: null,
                        fadeIn: 700,
                        fadeOut: 1000,
                        centerY: false,
                        timeout: options.timeout,
                        showOverlay: false,
                        css: options.growlCSS
                    });
                    return this.messageBlock(zindex, options);
                    break;
                case 'dialog':
                    $.extend(options, {
                        themedCSS: {
                            overflow: 'auto',
                            width: 'auto'
                        },
                        msgContentCSS: {
                            overflow: 'hidden' //hide the unneeded scrollbars in ie7
                        },
                        theme: true
                    });

                    return this.messageBlock(zindex, options);
                    break;
                default:
                    return this.messageBlock(zindex, options);
                    break;
            }
        }
    });
})(jQuery);