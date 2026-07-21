"use strict";
(() => {
    var Ne = Object.create;
    var se = Object.defineProperty;
    var Pe = Object.getOwnPropertyDescriptor;
    var ke = Object.getOwnPropertyNames;
    var Me = Object.getPrototypeOf,
        Re = Object.prototype.hasOwnProperty;
    var Oe = (e, t) => () => (t || e((t = {
        exports: {}
    }).exports, t), t.exports);
    var De = (e, t, i, n) => {
        if (t && typeof t == "object" || typeof t == "function")
            for (let c of ke(t)) !Re.call(e, c) && c !== i && se(e, c, {
                get: () => t[c],
                enumerable: !(n = Pe(t, c)) || n.enumerable
            });
        return e
    };
    var P = (e, t, i) => (i = e != null ? Ne(Me(e)) : {}, De(t || !e || !e.__esModule ? se(i, "default", {
        value: e,
        enumerable: !0
    }) : i, e));
    var y = Oe(($, ae) => {
        (function(e, t) {
            if (typeof define == "function" && define.amd) define("webextension-polyfill", ["module"], t);
            else if (typeof $ < "u") t(ae);
            else {
                var i = {
                    exports: {}
                };
                t(i), e.browser = i.exports
            }
        })(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : $, function(e) {
            "use strict";
            if (!(globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.id)) throw new Error("This script should only be loaded in a browser extension.");
            if (globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id) e.exports = globalThis.browser;
            else {
                let t = "The message port closed before a response was received.",
                    i = n => {
                        let c = {
                            alarms: {
                                clear: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                clearAll: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                get: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                getAll: {
                                    minArgs: 0,
                                    maxArgs: 0
                                }
                            },
                            bookmarks: {
                                create: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                get: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getChildren: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getRecent: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getSubTree: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getTree: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                move: {
                                    minArgs: 2,
                                    maxArgs: 2
                                },
                                remove: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                removeTree: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                search: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                update: {
                                    minArgs: 2,
                                    maxArgs: 2
                                }
                            },
                            browserAction: {
                                disable: {
                                    minArgs: 0,
                                    maxArgs: 1,
                                    fallbackToNoCallback: !0
                                },
                                enable: {
                                    minArgs: 0,
                                    maxArgs: 1,
                                    fallbackToNoCallback: !0
                                },
                                getBadgeBackgroundColor: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getBadgeText: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getPopup: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getTitle: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                openPopup: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                setBadgeBackgroundColor: {
                                    minArgs: 1,
                                    maxArgs: 1,
                                    fallbackToNoCallback: !0
                                },
                                setBadgeText: {
                                    minArgs: 1,
                                    maxArgs: 1,
                                    fallbackToNoCallback: !0
                                },
                                setIcon: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                setPopup: {
                                    minArgs: 1,
                                    maxArgs: 1,
                                    fallbackToNoCallback: !0
                                },
                                setTitle: {
                                    minArgs: 1,
                                    maxArgs: 1,
                                    fallbackToNoCallback: !0
                                }
                            },
                            browsingData: {
                                remove: {
                                    minArgs: 2,
                                    maxArgs: 2
                                },
                                removeCache: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                removeCookies: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                removeDownloads: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                removeFormData: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                removeHistory: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                removeLocalStorage: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                removePasswords: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                removePluginData: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                settings: {
                                    minArgs: 0,
                                    maxArgs: 0
                                }
                            },
                            commands: {
                                getAll: {
                                    minArgs: 0,
                                    maxArgs: 0
                                }
                            },
                            contextMenus: {
                                remove: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                removeAll: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                update: {
                                    minArgs: 2,
                                    maxArgs: 2
                                }
                            },
                            cookies: {
                                get: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getAll: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getAllCookieStores: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                remove: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                set: {
                                    minArgs: 1,
                                    maxArgs: 1
                                }
                            },
                            devtools: {
                                inspectedWindow: {
                                    eval: {
                                        minArgs: 1,
                                        maxArgs: 2,
                                        singleCallbackArg: !1
                                    }
                                },
                                panels: {
                                    create: {
                                        minArgs: 3,
                                        maxArgs: 3,
                                        singleCallbackArg: !0
                                    },
                                    elements: {
                                        createSidebarPane: {
                                            minArgs: 1,
                                            maxArgs: 1
                                        }
                                    }
                                }
                            },
                            downloads: {
                                cancel: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                download: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                erase: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getFileIcon: {
                                    minArgs: 1,
                                    maxArgs: 2
                                },
                                open: {
                                    minArgs: 1,
                                    maxArgs: 1,
                                    fallbackToNoCallback: !0
                                },
                                pause: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                removeFile: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                resume: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                search: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                show: {
                                    minArgs: 1,
                                    maxArgs: 1,
                                    fallbackToNoCallback: !0
                                }
                            },
                            extension: {
                                isAllowedFileSchemeAccess: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                isAllowedIncognitoAccess: {
                                    minArgs: 0,
                                    maxArgs: 0
                                }
                            },
                            history: {
                                addUrl: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                deleteAll: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                deleteRange: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                deleteUrl: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getVisits: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                search: {
                                    minArgs: 1,
                                    maxArgs: 1
                                }
                            },
                            i18n: {
                                detectLanguage: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getAcceptLanguages: {
                                    minArgs: 0,
                                    maxArgs: 0
                                }
                            },
                            identity: {
                                launchWebAuthFlow: {
                                    minArgs: 1,
                                    maxArgs: 1
                                }
                            },
                            idle: {
                                queryState: {
                                    minArgs: 1,
                                    maxArgs: 1
                                }
                            },
                            management: {
                                get: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getAll: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                getSelf: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                setEnabled: {
                                    minArgs: 2,
                                    maxArgs: 2
                                },
                                uninstallSelf: {
                                    minArgs: 0,
                                    maxArgs: 1
                                }
                            },
                            notifications: {
                                clear: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                create: {
                                    minArgs: 1,
                                    maxArgs: 2
                                },
                                getAll: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                getPermissionLevel: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                update: {
                                    minArgs: 2,
                                    maxArgs: 2
                                }
                            },
                            pageAction: {
                                getPopup: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getTitle: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                hide: {
                                    minArgs: 1,
                                    maxArgs: 1,
                                    fallbackToNoCallback: !0
                                },
                                setIcon: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                setPopup: {
                                    minArgs: 1,
                                    maxArgs: 1,
                                    fallbackToNoCallback: !0
                                },
                                setTitle: {
                                    minArgs: 1,
                                    maxArgs: 1,
                                    fallbackToNoCallback: !0
                                },
                                show: {
                                    minArgs: 1,
                                    maxArgs: 1,
                                    fallbackToNoCallback: !0
                                }
                            },
                            permissions: {
                                contains: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getAll: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                remove: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                request: {
                                    minArgs: 1,
                                    maxArgs: 1
                                }
                            },
                            runtime: {
                                getBackgroundPage: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                getPlatformInfo: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                openOptionsPage: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                requestUpdateCheck: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                sendMessage: {
                                    minArgs: 1,
                                    maxArgs: 3
                                },
                                sendNativeMessage: {
                                    minArgs: 2,
                                    maxArgs: 2
                                },
                                setUninstallURL: {
                                    minArgs: 1,
                                    maxArgs: 1
                                }
                            },
                            sessions: {
                                getDevices: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                getRecentlyClosed: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                restore: {
                                    minArgs: 0,
                                    maxArgs: 1
                                }
                            },
                            storage: {
                                local: {
                                    clear: {
                                        minArgs: 0,
                                        maxArgs: 0
                                    },
                                    get: {
                                        minArgs: 0,
                                        maxArgs: 1
                                    },
                                    getBytesInUse: {
                                        minArgs: 0,
                                        maxArgs: 1
                                    },
                                    remove: {
                                        minArgs: 1,
                                        maxArgs: 1
                                    },
                                    set: {
                                        minArgs: 1,
                                        maxArgs: 1
                                    }
                                },
                                managed: {
                                    get: {
                                        minArgs: 0,
                                        maxArgs: 1
                                    },
                                    getBytesInUse: {
                                        minArgs: 0,
                                        maxArgs: 1
                                    }
                                },
                                sync: {
                                    clear: {
                                        minArgs: 0,
                                        maxArgs: 0
                                    },
                                    get: {
                                        minArgs: 0,
                                        maxArgs: 1
                                    },
                                    getBytesInUse: {
                                        minArgs: 0,
                                        maxArgs: 1
                                    },
                                    remove: {
                                        minArgs: 1,
                                        maxArgs: 1
                                    },
                                    set: {
                                        minArgs: 1,
                                        maxArgs: 1
                                    }
                                }
                            },
                            tabs: {
                                captureVisibleTab: {
                                    minArgs: 0,
                                    maxArgs: 2
                                },
                                create: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                detectLanguage: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                discard: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                duplicate: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                executeScript: {
                                    minArgs: 1,
                                    maxArgs: 2
                                },
                                get: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getCurrent: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                getZoom: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                getZoomSettings: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                goBack: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                goForward: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                highlight: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                insertCSS: {
                                    minArgs: 1,
                                    maxArgs: 2
                                },
                                move: {
                                    minArgs: 2,
                                    maxArgs: 2
                                },
                                query: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                reload: {
                                    minArgs: 0,
                                    maxArgs: 2
                                },
                                remove: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                removeCSS: {
                                    minArgs: 1,
                                    maxArgs: 2
                                },
                                sendMessage: {
                                    minArgs: 2,
                                    maxArgs: 3
                                },
                                setZoom: {
                                    minArgs: 1,
                                    maxArgs: 2
                                },
                                setZoomSettings: {
                                    minArgs: 1,
                                    maxArgs: 2
                                },
                                update: {
                                    minArgs: 1,
                                    maxArgs: 2
                                }
                            },
                            topSites: {
                                get: {
                                    minArgs: 0,
                                    maxArgs: 0
                                }
                            },
                            webNavigation: {
                                getAllFrames: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                getFrame: {
                                    minArgs: 1,
                                    maxArgs: 1
                                }
                            },
                            webRequest: {
                                handlerBehaviorChanged: {
                                    minArgs: 0,
                                    maxArgs: 0
                                }
                            },
                            windows: {
                                create: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                get: {
                                    minArgs: 1,
                                    maxArgs: 2
                                },
                                getAll: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                getCurrent: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                getLastFocused: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                remove: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                update: {
                                    minArgs: 2,
                                    maxArgs: 2
                                }
                            }
                        };
                        if (Object.keys(c).length === 0) throw new Error("api-metadata.json has not been included in browser-polyfill");
                        class u extends WeakMap {
                            constructor(r, s = void 0) {
                                super(s), this.createItem = r
                            }
                            get(r) {
                                return this.has(r) || this.set(r, this.createItem(r)), super.get(r)
                            }
                        }
                        let re = o => o && typeof o == "object" && typeof o.then == "function",
                            I = (o, r) => (...s) => {
                                n.runtime.lastError ? o.reject(new Error(n.runtime.lastError.message)) : r.singleCallbackArg || s.length <= 1 && r.singleCallbackArg !== !1 ? o.resolve(s[0]) : o.resolve(s)
                            },
                            T = o => o == 1 ? "argument" : "arguments",
                            ye = (o, r) => function(a, ...g) {
                                if (g.length < r.minArgs) throw new Error(`Expected at least ${r.minArgs} ${T(r.minArgs)} for ${o}(), got ${g.length}`);
                                if (g.length > r.maxArgs) throw new Error(`Expected at most ${r.maxArgs} ${T(r.maxArgs)} for ${o}(), got ${g.length}`);
                                return new Promise((A, p) => {
                                    if (r.fallbackToNoCallback) try {
                                        a[o](...g, I({
                                            resolve: A,
                                            reject: p
                                        }, r))
                                    } catch (l) {
                                        console.warn(`${o} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `, l), a[o](...g), r.fallbackToNoCallback = !1, r.noCallback = !0, A()
                                    } else r.noCallback ? (a[o](...g), A()) : a[o](...g, I({
                                        resolve: A,
                                        reject: p
                                    }, r))
                                })
                            },
                            ne = (o, r, s) => new Proxy(r, {
                                apply(a, g, A) {
                                    return s.call(g, o, ...A)
                                }
                            }),
                            D = Function.call.bind(Object.prototype.hasOwnProperty),
                            _ = (o, r = {}, s = {}) => {
                                let a = Object.create(null),
                                    g = {
                                        has(p, l) {
                                            return l in o || l in a
                                        },
                                        get(p, l, f) {
                                            if (l in a) return a[l];
                                            if (!(l in o)) return;
                                            let m = o[l];
                                            if (typeof m == "function")
                                                if (typeof r[l] == "function") m = ne(o, o[l], r[l]);
                                                else if (D(s, l)) {
                                                let b = ye(l, s[l]);
                                                m = ne(o, o[l], b)
                                            } else m = m.bind(o);
                                            else if (typeof m == "object" && m !== null && (D(r, l) || D(s, l))) m = _(m, r[l], s[l]);
                                            else if (D(s, "*")) m = _(m, r[l], s["*"]);
                                            else return Object.defineProperty(a, l, {
                                                configurable: !0,
                                                enumerable: !0,
                                                get() {
                                                    return o[l]
                                                },
                                                set(b) {
                                                    o[l] = b
                                                }
                                            }), m;
                                            return a[l] = m, m
                                        },
                                        set(p, l, f, m) {
                                            return l in a ? a[l] = f : o[l] = f, !0
                                        },
                                        defineProperty(p, l, f) {
                                            return Reflect.defineProperty(a, l, f)
                                        },
                                        deleteProperty(p, l) {
                                            return Reflect.deleteProperty(a, l)
                                        }
                                    },
                                    A = Object.create(o);
                                return new Proxy(A, g)
                            },
                            H = o => ({
                                addListener(r, s, ...a) {
                                    r.addListener(o.get(s), ...a)
                                },
                                hasListener(r, s) {
                                    return r.hasListener(o.get(s))
                                },
                                removeListener(r, s) {
                                    r.removeListener(o.get(s))
                                }
                            }),
                            Le = new u(o => typeof o != "function" ? o : function(s) {
                                let a = _(s, {}, {
                                    getContent: {
                                        minArgs: 0,
                                        maxArgs: 0
                                    }
                                });
                                o(a)
                            }),
                            ie = new u(o => typeof o != "function" ? o : function(s, a, g) {
                                let A = !1,
                                    p, l = new Promise(N => {
                                        p = function(x) {
                                            A = !0, N(x)
                                        }
                                    }),
                                    f;
                                try {
                                    f = o(s, a, p)
                                } catch (N) {
                                    f = Promise.reject(N)
                                }
                                let m = f !== !0 && re(f);
                                if (f !== !0 && !m && !A) return !1;
                                let b = N => {
                                    N.then(x => {
                                        g(x)
                                    }, x => {
                                        let q;
                                        x && (x instanceof Error || typeof x.message == "string") ? q = x.message : q = "An unexpected error occurred", g({
                                            __mozWebExtensionPolyfillReject__: !0,
                                            message: q
                                        })
                                    }).catch(x => {
                                        console.error("Failed to send onMessage rejected reply", x)
                                    })
                                };
                                return b(m ? f : l), !0
                            }),
                            Ee = ({
                                reject: o,
                                resolve: r
                            }, s) => {
                                n.runtime.lastError ? n.runtime.lastError.message === t ? r() : o(new Error(n.runtime.lastError.message)) : s && s.__mozWebExtensionPolyfillReject__ ? o(new Error(s.message)) : r(s)
                            },
                            le = (o, r, s, ...a) => {
                                if (a.length < r.minArgs) throw new Error(`Expected at least ${r.minArgs} ${T(r.minArgs)} for ${o}(), got ${a.length}`);
                                if (a.length > r.maxArgs) throw new Error(`Expected at most ${r.maxArgs} ${T(r.maxArgs)} for ${o}(), got ${a.length}`);
                                return new Promise((g, A) => {
                                    let p = Ee.bind(null, {
                                        resolve: g,
                                        reject: A
                                    });
                                    a.push(p), s.sendMessage(...a)
                                })
                            },
                            Ie = {
                                devtools: {
                                    network: {
                                        onRequestFinished: H(Le)
                                    }
                                },
                                runtime: {
                                    onMessage: H(ie),
                                    onMessageExternal: H(ie),
                                    sendMessage: le.bind(null, "sendMessage", {
                                        minArgs: 1,
                                        maxArgs: 3
                                    })
                                },
                                tabs: {
                                    sendMessage: le.bind(null, "sendMessage", {
                                        minArgs: 2,
                                        maxArgs: 3
                                    })
                                }
                            },
                            V = {
                                clear: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                get: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                set: {
                                    minArgs: 1,
                                    maxArgs: 1
                                }
                            };
                        return c.privacy = {
                            network: {
                                "*": V
                            },
                            services: {
                                "*": V
                            },
                            websites: {
                                "*": V
                            }
                        }, _(n, Ie, c)
                    };
                e.exports = i(chrome)
            }
        })
    });
    var E = P(y(), 1);
    var h = P(y(), 1),
        _e = "#5B8DEF",
        Fe = "#4CAF7D",
        Ue = "#E2685C",
        ce = 99;

    function Ke(e) {
        return e === 0 ? "" : e > ce ? `${ce}+` : String(e)
    }
    async function F(e) {
        let t = e.reduce((i, n) => i + n.items.length, 0);
        await h.default.action.setBadgeBackgroundColor({
            color: _e
        }), await h.default.action.setBadgeText({
            text: Ke(t)
        })
    }
    async function W(e) {
        await h.default.action.setBadgeBackgroundColor({
            color: Fe
        }), await h.default.action.setBadgeText({
            text: "\u2713"
        }), setTimeout(() => {
            F(e)
        }, 1200)
    }
    async function U(e) {
        await h.default.action.setBadgeBackgroundColor({
            color: Ue
        }), await h.default.action.setBadgeText({
            text: "!"
        }), setTimeout(() => {
            F(e)
        }, 1500)
    }
    var Z = P(y(), 1);
    var v = P(y(), 1);
    var C = {
        STATE: "keepit:state",
        THEME: "keepit:theme",
        LOCALE: "keepit:locale"
    };

    function He() {
        return {
            schemaVersion: 1,
            collections: [],
            lastUsedCollectionId: null
        }
    }
    async function L() {
        return (await v.default.storage.local.get(C.STATE))[C.STATE] ?? He()
    }
    async function G(e) {
        await v.default.storage.local.set({
            [C.STATE]: e
        })
    }

    function me(e) {
        let t = (i, n) => {
            if (n !== "local") return;
            let c = i[C.STATE];
            c && e(c.newValue)
        };
        return v.default.storage.onChanged.addListener(t), () => v.default.storage.onChanged.removeListener(t)
    }
    async function ge() {
        return (await v.default.storage.local.get(C.LOCALE))[C.LOCALE] ?? "system"
    }

    function X(e) {
        let t = (i, n) => {
            if (n !== "local") return;
            let c = i[C.LOCALE];
            c && e(c.newValue)
        };
        return v.default.storage.onChanged.addListener(t), () => v.default.storage.onChanged.removeListener(t)
    }
    var z = {
        ar: {
            appName: "Keepit",
            cancel: "\u0625\u0644\u063A\u0627\u0621",
            save: "\u062D\u0641\u0638",
            confirm: "\u062A\u0623\u0643\u064A\u062F",
            "color.indigo": "\u0646\u064A\u0644\u064A",
            "color.sky": "\u0633\u0645\u0627\u0648\u064A",
            "color.violet": "\u0628\u0646\u0641\u0633\u062C\u064A",
            "color.emerald": "\u0632\u0645\u0631\u062F\u064A",
            "color.amber": "\u0643\u0647\u0631\u0645\u0627\u0646\u064A",
            "color.rose": "\u0648\u0631\u062F\u064A",
            "color.slate": "\u0631\u0645\u0627\u062F\u064A",
            colorPickerAriaLabel: "\u0644\u0648\u0646 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            themeSwitchToLight: "\u0627\u0644\u062A\u0628\u062F\u064A\u0644 \u0625\u0644\u0649 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0641\u0627\u062A\u062D",
            themeSwitchToDark: "\u0627\u0644\u062A\u0628\u062F\u064A\u0644 \u0625\u0644\u0649 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062F\u0627\u0643\u0646",
            languageSwitchAriaLabel: "\u062A\u063A\u064A\u064A\u0631 \u0644\u063A\u0629 \u0627\u0644\u0648\u0627\u062C\u0647\u0629",
            openFullManager: "\u0641\u062A\u062D \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0643\u0627\u0645\u0644",
            quickAddTabUnavailable: "\u062A\u0639\u0630\u0651\u0631 \u0642\u0631\u0627\u0621\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0647\u0630\u0627 \u0627\u0644\u062A\u0628\u0648\u064A\u0628",
            quickAddSelectCollection: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            quickAddSaved: "\u0645\u062D\u0641\u0648\u0638",
            quickAddAdd: "\u0625\u0636\u0627\u0641\u0629",
            quickAddShortcutHint: "\u0623\u0648 \u0627\u0636\u063A\u0637 {shortcut}",
            collectionsSectionTitle: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A",
            createCollectionAriaLabel: "\u0625\u0646\u0634\u0627\u0621 \u0645\u062C\u0645\u0648\u0639\u0629 \u062C\u062F\u064A\u062F\u0629",
            emptyCollectionsTitle: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0628\u0639\u062F",
            emptyCollectionsDescription: "\u0623\u0646\u0634\u0626 \u0645\u062C\u0645\u0648\u0639\u062A\u0643 \u0627\u0644\u0623\u0648\u0644\u0649 \u0644\u062A\u0628\u062F\u0623 \u0628\u062D\u0641\u0638 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0645\u0641\u064A\u062F\u0629.",
            emptyCollectionsAction: "\u0625\u0646\u0634\u0627\u0621 \u0645\u062C\u0645\u0648\u0639\u0629",
            emptyItemsTitle: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0641\u0627\u0631\u063A\u0629",
            emptyItemsDescription: "\u0623\u0636\u0641 \u0627\u0644\u062A\u0628\u0648\u064A\u0628 \u0627\u0644\u062D\u0627\u0644\u064A \u0623\u0648 \u0627\u0646\u0633\u062E \u0631\u0627\u0628\u0637\u064B\u0627 \u0645\u0646 \u0627\u0644\u0645\u062A\u0635\u0641\u062D \u0644\u062A\u0628\u062F\u0623.",
            backToCollections: "\u0627\u0644\u0631\u062C\u0648\u0639 \u0625\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A",
            deleteCollectionAriaLabel: '\u062D\u0630\u0641 \u0645\u062C\u0645\u0648\u0639\u0629 "{name}"',
            newCollectionTitle: "\u0645\u062C\u0645\u0648\u0639\u0629 \u062C\u062F\u064A\u062F\u0629",
            editCollectionTitle: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            createAction: "\u0625\u0646\u0634\u0627\u0621",
            saveChangesAction: "\u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A",
            collectionNameLabel: "\u0627\u0633\u0645 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            collectionNamePlaceholder: "\u0645\u062B\u0627\u0644: \u0623\u062F\u0648\u0627\u062A \u0627\u0644\u062A\u0637\u0648\u064A\u0631",
            collectionNameRequired: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0644\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            collectionColorLabel: "\u0627\u0644\u0644\u0648\u0646",
            deleteCollectionDialogTitle: "\u062D\u0630\u0641 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            deleteCollectionDialogMessage: '\u0633\u064A\u062A\u0645 \u062D\u0630\u0641 \u0645\u062C\u0645\u0648\u0639\u0629 "{name}" \u0648\u0643\u0644 \u0639\u0646\u0627\u0635\u0631\u0647\u0627 ({count}) \u0646\u0647\u0627\u0626\u064A\u064B\u0627. \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646\u0647.',
            deleteCollectionConfirmLabel: "\u062D\u0630\u0641 \u0646\u0647\u0627\u0626\u064A\u064B\u0627",
            editNoteAriaLabel: '\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629 \u0639\u0644\u0649 "{title}"',
            deleteItemAriaLabel: '\u062D\u0630\u0641 "{title}"',
            editNoteDialogTitle: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629",
            editNoteLabel: '\u0645\u0644\u0627\u062D\u0638\u0629 \u0639\u0644\u0649 "{title}"',
            toastItemAdded: "\u062A\u0645\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            toastItemAddFailed: "\u062A\u0639\u0630\u0651\u0631\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u0629",
            toastCollectionCreated: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            toastCollectionCreateFailed: "\u062A\u0639\u0630\u0651\u0631 \u0627\u0644\u0625\u0646\u0634\u0627\u0621",
            toastCollectionSaved: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A",
            toastCollectionSaveFailed: "\u062A\u0639\u0630\u0651\u0631 \u0627\u0644\u062D\u0641\u0638",
            toastCollectionDeleted: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            toastItemDeleted: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0639\u0646\u0635\u0631",
            toastNoteSaved: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629",
            toastNoteSaveFailed: "\u062A\u0639\u0630\u0651\u0631 \u0627\u0644\u062D\u0641\u0638",
            toastExportDownloaded: "\u062A\u0645 \u062A\u0646\u0632\u064A\u0644 \u0645\u0644\u0641 \u0627\u0644\u062A\u0635\u062F\u064A\u0631",
            toastNoCollectionsToExport: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0644\u062A\u0635\u062F\u064A\u0631\u0647\u0627",
            toastImportMerged: "\u062A\u0645 \u062F\u0645\u062C \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0648\u0631\u062F\u0629 \u0628\u0646\u062C\u0627\u062D",
            toastImportReplaced: "\u062A\u0645 \u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D",
            optionsTitle: "Keepit \u2014 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A",
            importAction: "\u0627\u0633\u062A\u064A\u0631\u0627\u062F",
            exportAllAction: "\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0643\u0644",
            searchPlaceholder: "\u0627\u0628\u062D\u062B \u0641\u064A \u0643\u0644 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629\u2026",
            searchAriaLabel: "\u0628\u062D\u062B",
            pinCollection: "\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            unpinCollection: "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062A\u062B\u0628\u064A\u062A",
            editCollectionAction: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            deleteCollectionAction: "\u062D\u0630\u0641 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            newCollectionAction: "\u0645\u062C\u0645\u0648\u0639\u0629 \u062C\u062F\u064A\u062F\u0629",
            openAllAction: "\u0641\u062A\u062D \u0627\u0644\u0643\u0644",
            exportAction: "\u062A\u0635\u062F\u064A\u0631",
            noCollectionSelectedTitle: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u062C\u0645\u0648\u0639\u0629 \u0645\u062D\u062F\u064E\u0651\u062F\u0629",
            noCollectionSelectedDescription: "\u0623\u0646\u0634\u0626 \u0645\u062C\u0645\u0648\u0639\u062A\u0643 \u0627\u0644\u0623\u0648\u0644\u0649 \u0644\u062A\u0628\u062F\u0623 \u0628\u062A\u0646\u0638\u064A\u0645 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0645\u0641\u064A\u062F\u0629.",
            emptyItemsDescriptionOptions: "\u0627\u062D\u0641\u0638 \u0635\u0641\u062D\u0629 \u0645\u0646 \u0645\u062A\u0635\u0641\u062D\u0643 \u0639\u0628\u0631 \u0627\u0644\u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u0645\u0646\u0628\u062B\u0642\u0629 \u0623\u0648 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0646\u0642\u0631 \u0628\u0627\u0644\u0632\u0631 \u0627\u0644\u0623\u064A\u0645\u0646.",
            openAllDialogTitle: "\u0641\u062A\u062D \u0643\u0644 \u0627\u0644\u0631\u0648\u0627\u0628\u0637",
            openAllDialogMessage: "\u0633\u064A\u062A\u0645 \u0641\u062A\u062D {count} \u062A\u0628\u0648\u064A\u0628\u064B\u0627 \u062C\u062F\u064A\u062F\u064B\u0627. \u0647\u0644 \u062A\u0631\u064A\u062F \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629\u061F",
            searchResultsTitle: "\u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0628\u062D\u062B",
            searchResultsEmptyTitle: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C",
            searchResultsEmptyDescription: '\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0645\u0648\u0627\u0642\u0639 \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0640 "{query}"',
            searchResultsInCollection: "\u0641\u064A {collection}",
            importDialogTitle: "\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0645\u062C\u0645\u0648\u0639\u0627\u062A",
            importFileLabel: "\u0627\u062E\u062A\u0631 \u0645\u0644\u0641 Keepit \u0628\u0635\u064A\u063A\u0629 JSON",
            importModeMergeTitle: "\u062F\u0645\u062C \u0645\u0639 \u0627\u0644\u0645\u0648\u062C\u0648\u062F",
            importModeMergeDesc: "\u062A\u064F\u0636\u0627\u0641 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0648\u0631\u062F\u0629 \u0625\u0644\u0649 \u062C\u0627\u0646\u0628 \u0645\u062C\u0645\u0648\u0639\u0627\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629.",
            importModeReplaceTitle: "\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0643\u0627\u0645\u0644",
            importModeReplaceDesc: "\u0633\u064A\u062A\u0645 \u062D\u0630\u0641 \u0643\u0644 \u0628\u064A\u0627\u0646\u0627\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0648\u0627\u0633\u062A\u0628\u062F\u0627\u0644\u0647\u0627 \u0628\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u0644\u0641. \u0625\u062C\u0631\u0627\u0621 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646\u0647.",
            importPreviewSummary: "{collections} \u0645\u062C\u0645\u0648\u0639\u0629 \xB7 {items} \u0639\u0646\u0635\u0631 \u062C\u0627\u0647\u0632 \u0644\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F",
            importPreviewWarning: "\u062A\u0645 \u062A\u062C\u0627\u0647\u0644 {collections} \u0645\u062C\u0645\u0648\u0639\u0629 \u0648{items} \u0639\u0646\u0635\u0631 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u064A\u0646",
            validationCollectionNameEmpty: "\u0627\u0633\u0645 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0641\u0627\u0631\u063A\u064B\u0627",
            validationCollectionNameTooLong: "\u0627\u0633\u0645 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u064A\u062C\u0628 \u0623\u0644\u0627 \u064A\u062A\u062C\u0627\u0648\u0632 {max} \u062D\u0631\u0641\u064B\u0627",
            validationUrlInvalid: "\u0627\u0644\u0631\u0627\u0628\u0637 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u061B \u064A\u064F\u0633\u0645\u062D \u0641\u0642\u0637 \u0628\u0631\u0648\u0627\u0628\u0637 http \u0623\u0648 https",
            validationTitleTooLong: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u064A\u062C\u0628 \u0623\u0644\u0627 \u064A\u062A\u062C\u0627\u0648\u0632 {max} \u062D\u0631\u0641\u064B\u0627",
            validationNoteTooLong: "\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629 \u064A\u062C\u0628 \u0623\u0644\u0627 \u062A\u062A\u062C\u0627\u0648\u0632 {max} \u062D\u0631\u0641\u064B\u0627",
            untitledItem: "\u0628\u062F\u0648\u0646 \u0639\u0646\u0648\u0627\u0646",
            genericInvalidValue: "\u0642\u064A\u0645\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629",
            serviceCollectionNotFound: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629",
            serviceMaxCollectionsReached: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u062C\u0627\u0648\u0632 {max} \u0645\u062C\u0645\u0648\u0639\u0629",
            serviceMaxItemsReached: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u062C\u0627\u0648\u0632 {max} \u0639\u0646\u0635\u0631 \u062F\u0627\u062E\u0644 \u0645\u062C\u0645\u0648\u0639\u0629 \u0648\u0627\u062D\u062F\u0629",
            serviceDuplicateUrl: "\u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u062D\u0641\u0648\u0638 \u0628\u0627\u0644\u0641\u0639\u0644 \u0641\u064A \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            serviceItemNotFound: "\u0627\u0644\u0639\u0646\u0635\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F",
            defaultCollectionName: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0623\u0648\u0644\u0649",
            importErrorInvalidJson: "\u0627\u0644\u0645\u0644\u0641 \u0644\u064A\u0633 \u0628\u0635\u064A\u063A\u0629 JSON \u0635\u0627\u0644\u062D\u0629",
            importErrorNotKeepitFile: "\u0647\u0630\u0627 \u0627\u0644\u0645\u0644\u0641 \u0644\u064A\u0633 \u0645\u0644\u0641 \u062A\u0635\u062F\u064A\u0631 \u0645\u0646 Keepit",
            importErrorUnknownFormat: "\u0635\u064A\u063A\u0629 \u0647\u0630\u0627 \u0627\u0644\u0645\u0644\u0641 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645\u0629. \u0627\u0644\u0645\u062F\u0639\u0648\u0645 \u062D\u0627\u0644\u064A\u064B\u0627: \u0645\u0644\u0641\u0627\u062A \u062A\u0635\u062F\u064A\u0631 Keepit \u0641\u0642\u0637",
            untitledCollection: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0628\u0644\u0627 \u0627\u0633\u0645",
            importErrorNoCollectionsFound: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0623\u064A \u0645\u062C\u0645\u0648\u0639\u0627\u062A \u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u0644\u0641",
            importErrorNoValidCollections: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0623\u064A \u0645\u062C\u0645\u0648\u0639\u0629 \u0635\u0627\u0644\u062D\u0629 \u0644\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F",
            importErrorReadFailed: "\u062A\u0639\u0630\u0651\u0631\u062A \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0645\u0644\u0641",
            importErrorDiskReadFailed: "\u062A\u0639\u0630\u0651\u0631\u062A \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0645\u0644\u0641 \u0645\u0646 \u0627\u0644\u0642\u0631\u0635",
            importModeGroupAriaLabel: "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F",
            exportFilenameFallback: "\u0645\u062C\u0645\u0648\u0639\u0629",
            exportDialogTitle: "\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A",
            contextMenuRoot: "\u0623\u0636\u0641 \u0625\u0644\u0649 Keepit",
            contextMenuNoCollections: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0628\u0639\u062F",
            contextMenuNewCollection: "\u0625\u0646\u0634\u0627\u0621 \u0645\u062C\u0645\u0648\u0639\u0629 \u062C\u062F\u064A\u062F\u0629\u2026"
        },
        en: {
            appName: "Keepit",
            cancel: "Cancel",
            save: "Save",
            confirm: "Confirm",
            "color.indigo": "Indigo",
            "color.sky": "Sky",
            "color.violet": "Violet",
            "color.emerald": "Emerald",
            "color.amber": "Amber",
            "color.rose": "Rose",
            "color.slate": "Slate",
            colorPickerAriaLabel: "Collection color",
            themeSwitchToLight: "Switch to light mode",
            themeSwitchToDark: "Switch to dark mode",
            languageSwitchAriaLabel: "Change interface language",
            openFullManager: "Open full manager",
            quickAddTabUnavailable: "Couldn't read this tab's info",
            quickAddSelectCollection: "Choose collection",
            quickAddSaved: "Saved",
            quickAddAdd: "Add",
            quickAddShortcutHint: "or press {shortcut}",
            collectionsSectionTitle: "Collections",
            createCollectionAriaLabel: "Create new collection",
            emptyCollectionsTitle: "No collections yet",
            emptyCollectionsDescription: "Create your first collection to start saving useful sites.",
            emptyCollectionsAction: "Create collection",
            emptyItemsTitle: "This collection is empty",
            emptyItemsDescription: "Add the current tab or copy a link from your browser to get started.",
            backToCollections: "Back to collections",
            deleteCollectionAriaLabel: 'Delete collection "{name}"',
            newCollectionTitle: "New collection",
            editCollectionTitle: "Edit collection",
            createAction: "Create",
            saveChangesAction: "Save changes",
            collectionNameLabel: "Collection name",
            collectionNamePlaceholder: "e.g. Dev tools",
            collectionNameRequired: "Please enter a collection name",
            collectionColorLabel: "Color",
            deleteCollectionDialogTitle: "Delete collection",
            deleteCollectionDialogMessage: 'Collection "{name}" and all its items ({count}) will be permanently deleted. This action cannot be undone.',
            deleteCollectionConfirmLabel: "Delete permanently",
            editNoteAriaLabel: 'Edit note on "{title}"',
            deleteItemAriaLabel: 'Delete "{title}"',
            editNoteDialogTitle: "Edit note",
            editNoteLabel: 'Note on "{title}"',
            toastItemAdded: "Added to collection",
            toastItemAddFailed: "Couldn't add item",
            toastCollectionCreated: "Collection created",
            toastCollectionCreateFailed: "Couldn't create collection",
            toastCollectionSaved: "Changes saved",
            toastCollectionSaveFailed: "Couldn't save changes",
            toastCollectionDeleted: "Collection deleted",
            toastItemDeleted: "Item deleted",
            toastNoteSaved: "Note saved",
            toastNoteSaveFailed: "Couldn't save note",
            toastExportDownloaded: "Export file downloaded",
            toastNoCollectionsToExport: "No collections to export",
            toastImportMerged: "Imported collections merged successfully",
            toastImportReplaced: "Data replaced successfully",
            optionsTitle: "Keepit \u2014 Manage collections",
            importAction: "Import",
            exportAllAction: "Export all",
            searchPlaceholder: "Search all saved sites\u2026",
            searchAriaLabel: "Search",
            pinCollection: "Pin collection",
            unpinCollection: "Unpin collection",
            editCollectionAction: "Edit collection",
            deleteCollectionAction: "Delete collection",
            newCollectionAction: "New collection",
            openAllAction: "Open all",
            exportAction: "Export",
            noCollectionSelectedTitle: "No collection selected",
            noCollectionSelectedDescription: "Create your first collection to start organizing useful sites.",
            emptyItemsDescriptionOptions: "Save a page from your browser via the popup or the right-click menu.",
            openAllDialogTitle: "Open all links",
            openAllDialogMessage: "This will open {count} new tabs. Continue?",
            searchResultsTitle: "Search results",
            searchResultsEmptyTitle: "No results",
            searchResultsEmptyDescription: 'No saved sites match "{query}"',
            searchResultsInCollection: "in {collection}",
            importDialogTitle: "Import collections",
            importFileLabel: "Choose a Keepit JSON file",
            importModeMergeTitle: "Merge with existing",
            importModeMergeDesc: "Imported collections are added alongside your current ones.",
            importModeReplaceTitle: "Full replace",
            importModeReplaceDesc: "All your current data will be deleted and replaced with the file's content. This cannot be undone.",
            importPreviewSummary: "{collections} collection(s) \xB7 {items} item(s) ready to import",
            importPreviewWarning: "Skipped {collections} invalid collection(s) and {items} invalid item(s)",
            validationCollectionNameEmpty: "Collection name can't be empty",
            validationCollectionNameTooLong: "Collection name must not exceed {max} characters",
            validationUrlInvalid: "Invalid link; only http or https links are allowed",
            validationTitleTooLong: "Title must not exceed {max} characters",
            validationNoteTooLong: "Note must not exceed {max} characters",
            untitledItem: "Untitled",
            genericInvalidValue: "Invalid value",
            serviceCollectionNotFound: "This collection no longer exists",
            serviceMaxCollectionsReached: "You can't have more than {max} collections",
            serviceMaxItemsReached: "A collection can't have more than {max} items",
            serviceDuplicateUrl: "This link is already saved in the collection",
            serviceItemNotFound: "This item no longer exists",
            defaultCollectionName: "My first collection",
            importErrorInvalidJson: "This file isn't valid JSON",
            importErrorNotKeepitFile: "This isn't a Keepit export file",
            importErrorUnknownFormat: "Unsupported file format. Currently supported: Keepit export files only",
            untitledCollection: "Untitled collection",
            importErrorNoCollectionsFound: "No collections found in this file",
            importErrorNoValidCollections: "No valid collection found to import",
            importErrorReadFailed: "Couldn't read the file",
            importErrorDiskReadFailed: "Couldn't read the file from disk",
            importModeGroupAriaLabel: "Import mode",
            exportFilenameFallback: "collection",
            exportDialogTitle: "Export collections",
            contextMenuRoot: "Add to Keepit",
            contextMenuNoCollections: "No collections yet",
            contextMenuNewCollection: "Create new collection\u2026"
        }
    };

    function Ve() {
        return ((typeof navigator < "u" ? navigator.language : "ar") || "ar").toLowerCase().startsWith("ar") ? "ar" : "en"
    }

    function qe(e) {
        return e === "system" ? Ve() : e
    }
    var J = "ar";
    async function K() {
        let e = await ge();
        return J = qe(e), J
    }

    function d(e, t) {
        let n = z[J][e] ?? z.ar[e] ?? e;
        if (t)
            for (let [c, u] of Object.entries(t)) n = n.replace(new RegExp(`\\{${c}\\}`, "g"), String(u));
        return n
    }
    var k = "keepit-root",
        de = "keepit-new-collection",
        B = "keepit-collection:",
        M = ["page", "link"];

    function R(e) {
        try {
            Z.default.contextMenus.create(e)
        } catch {}
    }

    function ue(e) {
        return e.startsWith(B) ? e.slice(B.length) : null
    }

    function Ae(e) {
        return e === de
    }
    var Y = Promise.resolve();

    function pe(e) {
        return Y = Y.then(() => $e(e)), Y
    }
    async function $e(e) {
        if (await K(), await Z.default.contextMenus.removeAll(), R({
                id: k,
                title: d("contextMenuRoot"),
                contexts: M
            }), e.length === 0) R({
            id: `${B}__disabled`,
            parentId: k,
            title: d("contextMenuNoCollections"),
            enabled: !1,
            contexts: M
        });
        else
            for (let t of e) R({
                id: `${B}${t.id}`,
                parentId: k,
                title: t.name,
                contexts: M
            });
        R({
            id: "keepit-separator",
            parentId: k,
            type: "separator",
            contexts: M
        }), R({
            id: de,
            parentId: k,
            title: d("contextMenuNewCollection"),
            contexts: M
        })
    }
    var fe = "indigo";

    function Q() {
        return crypto.randomUUID()
    }
    var We = new Set(["http:", "https:"]);

    function xe(e) {
        try {
            let t = new URL(e);
            return We.has(t.protocol)
        } catch {
            return !1
        }
    }

    function Ce(e) {
        return e.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim()
    }

    function ee(e) {
        try {
            return new URL(e).hostname.replace(/^www\./, "")
        } catch {
            return e
        }
    }

    function he(e) {
        let t = e.trim();
        return xe(t) ? {
            valid: !0,
            value: t
        } : {
            valid: !1,
            error: d("validationUrlInvalid")
        }
    }

    function we(e) {
        let t = Ce(e) || d("untitledItem");
        return t.length > 300 ? {
            valid: !1,
            error: d("validationTitleTooLong", {
                max: 300
            })
        } : {
            valid: !0,
            value: t
        }
    }
    var w = class extends Error {};

    function Ge(e, t) {
        let i = e.collections.find(n => n.id === t);
        if (!i) throw new w(d("serviceCollectionNotFound"));
        return i
    }
    async function S() {
        return [...(await L()).collections].sort((t, i) => t.pinned !== i.pinned ? t.pinned ? -1 : 1 : i.createdAt - t.createdAt)
    }
    async function te(e, t) {
        let i = he(t.url);
        if (!i.valid || !i.value) throw new w(i.error ?? d("genericInvalidValue"));
        let n = we(t.title);
        if (!n.valid || !n.value) throw new w(n.error ?? d("genericInvalidValue"));
        let c = await L(),
            u = Ge(c, e);
        if (u.items.length >= 1e3) throw new w(d("serviceMaxItemsReached", {
            max: 1e3
        }));
        if (u.items.some(T => T.url === i.value)) throw new w(d("serviceDuplicateUrl"));
        let I = {
            id: Q(),
            url: i.value,
            title: n.value,
            faviconUrl: t.faviconUrl,
            note: t.note,
            createdAt: Date.now(),
            order: u.items.length
        };
        return u.items.push(I), u.updatedAt = Date.now(), c.lastUsedCollectionId = e, await G(c), I
    }
    async function oe() {
        let e = await L();
        if (e.collections.length > 0) return;
        await K();
        let t = Date.now();
        e.collections.push({
            id: Q(),
            name: d("defaultCollectionName"),
            color: fe,
            pinned: !1,
            createdAt: t,
            updatedAt: t,
            items: []
        }), await G(e)
    }
    var Te = P(y(), 1);
    async function be() {
        let [e] = await Te.default.tabs.query({
            active: !0,
            currentWindow: !0
        });
        return !e || !e.url ? null : {
            url: e.url,
            title: e.title || e.url,
            faviconUrl: e.favIconUrl
        }
    }
    async function O() {
        let e = await S();
        await Promise.all([pe(e), F(e)])
    }
    E.default.runtime.onInstalled.addListener(() => {
        (async () => (await oe(), await O()))()
    });
    E.default.runtime.onStartup.addListener(() => {
        O()
    });
    me(() => {
        O()
    });
    X(() => {
        O()
    });
    async function ze() {
        await oe();
        let [e, t] = await Promise.all([L(), be()]), i = e.collections.find(n => n.id === e.lastUsedCollectionId)?.id ?? e.collections[0]?.id;
        if (!i || !t) {
            let n = await S();
            await U(n);
            return
        }
        try {
            await te(i, {
                url: t.url,
                title: t.title,
                faviconUrl: t.faviconUrl
            });
            let n = await S();
            await W(n)
        } catch {
            let n = await S();
            await U(n)
        }
    }
    E.default.commands.onCommand.addListener(e => {
        e === "save-current-tab" && ze()
    });
    E.default.contextMenus.onClicked.addListener((e, t) => {
        (async () => {
            if (Ae(String(e.menuItemId))) {
                await E.default.runtime.openOptionsPage();
                return
            }
            let i = ue(String(e.menuItemId));
            if (!i) return;
            let n = e.linkUrl ?? e.pageUrl ?? t?.url;
            if (!n) return;
            let c = e.linkUrl ? e.selectionText?.trim() || ee(e.linkUrl) : t?.title || ee(n);
            try {
                await te(i, {
                    url: n,
                    title: c,
                    faviconUrl: e.linkUrl ? void 0 : t?.favIconUrl
                });
                let u = await S();
                await W(u)
            } catch {
                let u = await S();
                await U(u)
            }
        })()
    });
    O();
})();