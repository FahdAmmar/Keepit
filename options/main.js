"use strict";
(() => {
    var Mt = Object.create;
    var Pe = Object.defineProperty;
    var Pt = Object.getOwnPropertyDescriptor;
    var Rt = Object.getOwnPropertyNames;
    var Ft = Object.getPrototypeOf,
        Dt = Object.prototype.hasOwnProperty;
    var Ot = (t, e) => () => (e || t((e = {
        exports: {}
    }).exports, e), e.exports);
    var Ht = (t, e, o, r) => {
        if (e && typeof e == "object" || typeof e == "function")
            for (let i of Rt(e)) !Dt.call(t, i) && i !== o && Pe(t, i, {
                get: () => e[i],
                enumerable: !(r = Pt(e, i)) || r.enumerable
            });
        return t
    };
    var Re = (t, e, o) => (o = t != null ? Mt(Ft(t)) : {}, Ht(e || !t || !t.__esModule ? Pe(o, "default", {
        value: t,
        enumerable: !0
    }) : o, t));
    var ye = Ot((be, Fe) => {
        (function(t, e) {
            if (typeof define == "function" && define.amd) define("webextension-polyfill", ["module"], e);
            else if (typeof be < "u") e(Fe);
            else {
                var o = {
                    exports: {}
                };
                e(o), t.browser = o.exports
            }
        })(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : be, function(t) {
            "use strict";
            if (!(globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.id)) throw new Error("This script should only be loaded in a browser extension.");
            if (globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id) t.exports = globalThis.browser;
            else {
                let e = "The message port closed before a response was received.",
                    o = r => {
                        let i = {
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
                        if (Object.keys(i).length === 0) throw new Error("api-metadata.json has not been included in browser-polyfill");
                        class l extends WeakMap {
                            constructor(c, u = void 0) {
                                super(u), this.createItem = c
                            }
                            get(c) {
                                return this.has(c) || this.set(c, this.createItem(c)), super.get(c)
                            }
                        }
                        let m = s => s && typeof s == "object" && typeof s.then == "function",
                            g = (s, c) => (...u) => {
                                r.runtime.lastError ? s.reject(new Error(r.runtime.lastError.message)) : c.singleCallbackArg || u.length <= 1 && c.singleCallbackArg !== !1 ? s.resolve(u[0]) : s.resolve(u)
                            },
                            d = s => s == 1 ? "argument" : "arguments",
                            h = (s, c) => function(b, ...k) {
                                if (k.length < c.minArgs) throw new Error(`Expected at least ${c.minArgs} ${d(c.minArgs)} for ${s}(), got ${k.length}`);
                                if (k.length > c.maxArgs) throw new Error(`Expected at most ${c.maxArgs} ${d(c.maxArgs)} for ${s}(), got ${k.length}`);
                                return new Promise((N, F) => {
                                    if (c.fallbackToNoCallback) try {
                                        b[s](...k, g({
                                            resolve: N,
                                            reject: F
                                        }, c))
                                    } catch (p) {
                                        console.warn(`${s} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `, p), b[s](...k), c.fallbackToNoCallback = !1, c.noCallback = !0, N()
                                    } else c.noCallback ? (b[s](...k), N()) : b[s](...k, g({
                                        resolve: N,
                                        reject: F
                                    }, c))
                                })
                            },
                            f = (s, c, u) => new Proxy(c, {
                                apply(b, k, N) {
                                    return u.call(k, s, ...N)
                                }
                            }),
                            x = Function.call.bind(Object.prototype.hasOwnProperty),
                            T = (s, c = {}, u = {}) => {
                                let b = Object.create(null),
                                    k = {
                                        has(F, p) {
                                            return p in s || p in b
                                        },
                                        get(F, p, D) {
                                            if (p in b) return b[p];
                                            if (!(p in s)) return;
                                            let w = s[p];
                                            if (typeof w == "function")
                                                if (typeof c[p] == "function") w = f(s, s[p], c[p]);
                                                else if (x(u, p)) {
                                                let G = h(p, u[p]);
                                                w = f(s, s[p], G)
                                            } else w = w.bind(s);
                                            else if (typeof w == "object" && w !== null && (x(c, p) || x(u, p))) w = T(w, c[p], u[p]);
                                            else if (x(u, "*")) w = T(w, c[p], u["*"]);
                                            else return Object.defineProperty(b, p, {
                                                configurable: !0,
                                                enumerable: !0,
                                                get() {
                                                    return s[p]
                                                },
                                                set(G) {
                                                    s[p] = G
                                                }
                                            }), w;
                                            return b[p] = w, w
                                        },
                                        set(F, p, D, w) {
                                            return p in b ? b[p] = D : s[p] = D, !0
                                        },
                                        defineProperty(F, p, D) {
                                            return Reflect.defineProperty(b, p, D)
                                        },
                                        deleteProperty(F, p) {
                                            return Reflect.deleteProperty(b, p)
                                        }
                                    },
                                    N = Object.create(s);
                                return new Proxy(N, k)
                            },
                            E = s => ({
                                addListener(c, u, ...b) {
                                    c.addListener(s.get(u), ...b)
                                },
                                hasListener(c, u) {
                                    return c.hasListener(s.get(u))
                                },
                                removeListener(c, u) {
                                    c.removeListener(s.get(u))
                                }
                            }),
                            A = new l(s => typeof s != "function" ? s : function(u) {
                                let b = T(u, {}, {
                                    getContent: {
                                        minArgs: 0,
                                        maxArgs: 0
                                    }
                                });
                                s(b)
                            }),
                            C = new l(s => typeof s != "function" ? s : function(u, b, k) {
                                let N = !1,
                                    F, p = new Promise(J => {
                                        F = function(K) {
                                            N = !0, J(K)
                                        }
                                    }),
                                    D;
                                try {
                                    D = s(u, b, F)
                                } catch (J) {
                                    D = Promise.reject(J)
                                }
                                let w = D !== !0 && m(D);
                                if (D !== !0 && !w && !N) return !1;
                                let G = J => {
                                    J.then(K => {
                                        k(K)
                                    }, K => {
                                        let xe;
                                        K && (K instanceof Error || typeof K.message == "string") ? xe = K.message : xe = "An unexpected error occurred", k({
                                            __mozWebExtensionPolyfillReject__: !0,
                                            message: xe
                                        })
                                    }).catch(K => {
                                        console.error("Failed to send onMessage rejected reply", K)
                                    })
                                };
                                return G(w ? D : p), !0
                            }),
                            L = ({
                                reject: s,
                                resolve: c
                            }, u) => {
                                r.runtime.lastError ? r.runtime.lastError.message === e ? c() : s(new Error(r.runtime.lastError.message)) : u && u.__mozWebExtensionPolyfillReject__ ? s(new Error(u.message)) : c(u)
                            },
                            _ = (s, c, u, ...b) => {
                                if (b.length < c.minArgs) throw new Error(`Expected at least ${c.minArgs} ${d(c.minArgs)} for ${s}(), got ${b.length}`);
                                if (b.length > c.maxArgs) throw new Error(`Expected at most ${c.maxArgs} ${d(c.maxArgs)} for ${s}(), got ${b.length}`);
                                return new Promise((k, N) => {
                                    let F = L.bind(null, {
                                        resolve: k,
                                        reject: N
                                    });
                                    b.push(F), u.sendMessage(...b)
                                })
                            },
                            j = {
                                devtools: {
                                    network: {
                                        onRequestFinished: E(A)
                                    }
                                },
                                runtime: {
                                    onMessage: E(C),
                                    onMessageExternal: E(C),
                                    sendMessage: _.bind(null, "sendMessage", {
                                        minArgs: 1,
                                        maxArgs: 3
                                    })
                                },
                                tabs: {
                                    sendMessage: _.bind(null, "sendMessage", {
                                        minArgs: 2,
                                        maxArgs: 3
                                    })
                                }
                            },
                            S = {
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
                        return i.privacy = {
                            network: {
                                "*": S
                            },
                            services: {
                                "*": S
                            },
                            websites: {
                                "*": S
                            }
                        }, T(r, j, i)
                    };
                t.exports = o(chrome)
            }
        })
    });
    var _t = Re(ye(), 1);
    var ie = "indigo",
        ne = ["indigo", "sky", "violet", "emerald", "amber", "rose", "slate"];
    var M = Re(ye(), 1);
    var I = {
        STATE: "keepit:state",
        THEME: "keepit:theme",
        LOCALE: "keepit:locale"
    };

    function Kt() {
        return {
            schemaVersion: 1,
            collections: [],
            lastUsedCollectionId: null
        }
    }
    async function P() {
        return (await M.default.storage.local.get(I.STATE))[I.STATE] ?? Kt()
    }
    async function z(t) {
        await M.default.storage.local.set({
            [I.STATE]: t
        })
    }

    function De(t) {
        let e = (o, r) => {
            if (r !== "local") return;
            let i = o[I.STATE];
            i && t(i.newValue)
        };
        return M.default.storage.onChanged.addListener(e), () => M.default.storage.onChanged.removeListener(e)
    }
    async function Oe() {
        return (await M.default.storage.local.get(I.LOCALE))[I.LOCALE] ?? "system"
    }
    async function He(t) {
        await M.default.storage.local.set({
            [I.LOCALE]: t
        })
    }

    function Ue(t) {
        let e = (o, r) => {
            if (r !== "local") return;
            let i = o[I.LOCALE];
            i && t(i.newValue)
        };
        return M.default.storage.onChanged.addListener(e), () => M.default.storage.onChanged.removeListener(e)
    }
    async function Ke() {
        return (await M.default.storage.local.get(I.THEME))[I.THEME] ?? "system"
    }
    async function ze(t) {
        await M.default.storage.local.set({
            [I.THEME]: t
        })
    }

    function Ve(t) {
        let e = (o, r) => {
            if (r !== "local") return;
            let i = o[I.THEME];
            i && t(i.newValue)
        };
        return M.default.storage.onChanged.addListener(e), () => M.default.storage.onChanged.removeListener(e)
    }

    function B() {
        return crypto.randomUUID()
    }
    var zt = new Set(["http:", "https:"]);

    function ae(t) {
        try {
            let e = new URL(t);
            return zt.has(e.protocol)
        } catch {
            return !1
        }
    }

    function le(t) {
        return t.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim()
    }

    function W(t) {
        try {
            return new URL(t).hostname.replace(/^www\./, "")
        } catch {
            return t
        }
    }
    var je = {
        ar: "rtl",
        en: "ltr"
    };
    var Ae = {
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
            serviceDuplicateItemTitle: "\u064A\u0648\u062C\u062F \u0645\u0648\u0642\u0639 \u0628\u0646\u0641\u0633 \u0627\u0644\u0627\u0633\u0645 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            serviceDuplicateCollectionName: "\u062A\u0648\u062C\u062F \u0645\u062C\u0645\u0648\u0639\u0629 \u0628\u0646\u0641\u0633 \u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0641\u0639\u0644",
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
            serviceDuplicateItemTitle: "A site with this title already exists in this collection",
            serviceDuplicateCollectionName: "A collection with this name already exists",
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

    function Vt() {
        return ((typeof navigator < "u" ? navigator.language : "ar") || "ar").toLowerCase().startsWith("ar") ? "ar" : "en"
    }

    function Ce(t) {
        return t === "system" ? Vt() : t
    }

    function we(t) {
        document.documentElement.lang = t, document.documentElement.dir = je[t]
    }
    var V = "ar";

    function a(t, e) {
        let r = Ae[V][t] ?? Ae.ar[t] ?? t;
        if (e)
            for (let [i, l] of Object.entries(e)) r = r.replace(new RegExp(`\\{${i}\\}`, "g"), String(l));
        return r
    }
    async function Be(t) {
        let e = await Oe();
        V = Ce(e), we(V);
        let o = Ue(i => {
            i !== e && (e = i, V = Ce(e), we(V), t?.(V, e))
        });
        return {
            get locale() {
                return V
            },
            get preference() {
                return e
            },
            setPreference: async i => {
                e = i, V = Ce(e), we(V), await He(e), t?.(V, e)
            },
            destroy: o
        }
    }

    function Y(t) {
        let e = le(t);
        return e.length === 0 ? {
            valid: !1,
            error: a("validationCollectionNameEmpty")
        } : e.length > 60 ? {
            valid: !1,
            error: a("validationCollectionNameTooLong", {
                max: 60
            })
        } : {
            valid: !0,
            value: e
        }
    }

    function qe(t) {
        return typeof t == "string" && ne.includes(t)
    }

    function ee(t) {
        let e = t.trim();
        return ae(e) ? {
            valid: !0,
            value: e
        } : {
            valid: !1,
            error: a("validationUrlInvalid")
        }
    }

    function te(t) {
        let e = le(t) || a("untitledItem");
        return e.length > 300 ? {
            valid: !1,
            error: a("validationTitleTooLong", {
                max: 300
            })
        } : {
            valid: !0,
            value: e
        }
    }

    function Ge(t) {
        let e = le(t);
        return e.length > 500 ? {
            valid: !1,
            error: a("validationNoteTooLong", {
                max: 500
            })
        } : {
            valid: !0,
            value: e
        }
    }
    var $ = class extends Error {};

    function oe(t, e) {
        let o = t.collections.find(r => r.id === e);
        if (!o) throw new $(a("serviceCollectionNotFound"));
        return o
    }
    async function Xe() {
        return [...(await P()).collections].sort((e, o) => e.pinned !== o.pinned ? e.pinned ? -1 : 1 : o.updatedAt - e.updatedAt)
    }
    async function Qe(t, e = ie) {
        let o = Y(t);
        if (!o.valid || !o.value) throw new $(o.error ?? a("genericInvalidValue"));
        let r = await P();
        if (r.collections.length >= 200) throw new $(a("serviceMaxCollectionsReached", {
            max: 200
        }));
        if (globalThis.KeepitDedup && globalThis.KeepitDedup.findDuplicateCollection(r.collections, o.value)) throw new $(a("serviceDuplicateCollectionName"));
        let i = Date.now(),
            l = {
                id: B(),
                name: o.value,
                color: e,
                pinned: !1,
                createdAt: i,
                updatedAt: i,
                items: []
            };
        return r.collections.push(l), r.lastUsedCollectionId = l.id, await z(r), l
    }
    async function Je(t, e) {
        let o = Y(e);
        if (!o.valid || !o.value) throw new $(o.error ?? a("genericInvalidValue"));
        let r = await P(),
            i = oe(r, t);
        if (globalThis.KeepitDedup && globalThis.KeepitDedup.findDuplicateCollection(r.collections, o.value, t)) throw new $(a("serviceDuplicateCollectionName"));
        return i.name = o.value, i.updatedAt = Date.now(), await z(r), i
    }
    async function Ze(t, e) {
        let o = await P(),
            r = oe(o, t);
        return r.color = e, r.updatedAt = Date.now(), await z(o), r
    }
    async function Ye(t) {
        let e = await P(),
            o = oe(e, t);
        return o.pinned = !o.pinned, o.updatedAt = Date.now(), await z(e), o
    }
    async function et(t) {
        let e = await P();
        e.collections = e.collections.filter(o => o.id !== t), e.lastUsedCollectionId === t && (e.lastUsedCollectionId = null), await z(e)
    }
    async function tt(t, e, o) {
        let r = Ge(o);
        if (!r.valid) throw new $(r.error ?? a("genericInvalidValue"));
        let i = await P(),
            l = oe(i, t),
            m = l.items.find(g => g.id === e);
        if (!m) throw new $(a("serviceItemNotFound"));
        return m.note = r.value, l.updatedAt = Date.now(), await z(i), m
    }
    async function ot(t, e) {
        let o = await P(),
            r = oe(o, t);
        r.items = r.items.filter(i => i.id !== e).map((i, l) => ({
            ...i,
            order: l
        })), r.updatedAt = Date.now(), await z(o)
    }
    var ke = ["#5B8DEF", "#8B7CF6", "#4FB8D0", "#4CAF7D", "#E0A63E", "#E2685C", "#7C8DB5"];

    function Bt(t) {
        let e = 0;
        for (let o = 0; o < t.length; o += 1) e = e * 31 + t.charCodeAt(o) >>> 0;
        return ke[e % ke.length] ?? ke[0]
    }

    function rt(t) {
        let e = W(t);
        return {
            letter: e.charAt(0).toUpperCase() || "?",
            backgroundColor: Bt(e)
        }
    }

    function me(t) {
        return t ? t.startsWith("data:image/") ? !0 : ae(t) : !1
    }

    function H(t) {
        return typeof t == "object" && t !== null && !Array.isArray(t)
    }

    function q(t, e, o = "") {
        let r = t[e];
        return typeof r == "string" ? r : o
    }

    function it(t, e) {
        let o = t[e];
        return typeof o == "number" && Number.isFinite(o) ? o : void 0
    }
    var O = class extends Error {};

    function Qt(t) {
        return {
            name: t.name,
            color: t.color,
            items: [...t.items].sort((e, o) => e.order - o.order).map(e => ({
                url: e.url,
                title: e.title,
                ...e.faviconUrl ? {
                    faviconUrl: e.faviconUrl
                } : {},
                ...e.note ? {
                    note: e.note
                } : {},
                createdAt: e.createdAt
            }))
        }
    }

    function Jt(t) {
        return {
            app: "keepit",
            formatVersion: 1,
            exportedAt: Date.now(),
            collections: t.map(Qt)
        }
    }

    function Ee(t) {
        return Jt(t)
    }

    function Te(t) {
        return JSON.stringify(t, null, 2)
    }

    function Le(t, e) {
        let o = new Blob([e], {
                type: "application/json"
            }),
            r = URL.createObjectURL(o);
        try {
            let i = document.createElement("a");
            i.href = r, i.download = t, i.rel = "noopener", document.body.append(i), i.click(), i.remove()
        } finally {
            setTimeout(() => URL.revokeObjectURL(r), 1e3)
        }
    }

    function Zt(t) {
        let e = t.collections;
        if (!Array.isArray(e)) throw new O(a("importErrorNoCollectionsFound"));
        let o = [],
            r = 0,
            i = 0;
        for (let l of e) {
            if (!H(l)) {
                r += 1;
                continue
            }
            let m = Y(String(l.name ?? ""));
            if (!m.valid || !m.value) {
                r += 1;
                continue
            }
            let g = qe(l.color) ? l.color : ie,
                d = Array.isArray(l.items) ? l.items : [],
                h = [];
            d.forEach((x, T) => {
                if (!H(x)) {
                    i += 1;
                    return
                }
                let E = ee(String(x.url ?? "")),
                    A = te(String(x.title ?? ""));
                if (!E.valid || !E.value || !A.valid || !A.value) {
                    i += 1;
                    return
                }
                let C = x.faviconUrl,
                    L = typeof C == "string" && me(C) ? C : void 0,
                    _ = x.createdAt,
                    j = typeof _ == "number" && Number.isFinite(_) ? _ : Date.now(),
                    S = x.note;
                h.push({
                    id: B(),
                    url: E.value,
                    title: A.value,
                    faviconUrl: L,
                    note: typeof S == "string" ? S.slice(0, 500) : void 0,
                    createdAt: j,
                    order: T
                })
            });
            let f = Date.now();
            o.push({
                id: B(),
                name: m.value,
                color: g,
                pinned: !1,
                createdAt: f,
                updatedAt: f,
                items: h
            })
        }
        if (o.length === 0) throw new O(a("importErrorNoValidCollections"));
        return {
            collections: o,
            skippedCollections: r,
            skippedItems: i
        }
    }

    function ct(t) {
        let e;
        try {
            e = JSON.parse(t)
        } catch {
            throw new O(a("importErrorInvalidJson"))
        }
        if (!H(e)) throw new O(a("importErrorUnknownFormat"));
        if (e.app === "keepit") return Zt(e);
        throw new O(a("importErrorUnknownFormat"))
    }
    async function mt(t, e) {
        let o = await P(),
            r;
        if (e === "replace") {
            if (globalThis.KeepitDedup) {
                let res = globalThis.KeepitDedup.mergeCollections([], t.collections);
                r = {
                    schemaVersion: o.schemaVersion,
                    collections: res.merged,
                    lastUsedCollectionId: t.collections[0]?.id ?? null
                };
            } else {
                r = {
                    schemaVersion: o.schemaVersion,
                    collections: t.collections,
                    lastUsedCollectionId: t.collections[0]?.id ?? null
                };
            }
        } else {
            if (globalThis.KeepitDedup) {
                let res = globalThis.KeepitDedup.mergeCollections(o.collections, t.collections);
                r = {
                    schemaVersion: o.schemaVersion,
                    collections: res.merged,
                    lastUsedCollectionId: o.lastUsedCollectionId
                };
            } else {
                r = {
                    schemaVersion: o.schemaVersion,
                    collections: [...o.collections, ...t.collections],
                    lastUsedCollectionId: o.lastUsedCollectionId
                };
            }
        }
        await z(r)
    }
    var eo = "data-theme",
        dt = "(prefers-color-scheme: dark)";

    function pt() {
        return window.matchMedia(dt).matches ? "dark" : "light"
    }

    function _e(t) {
        return t === "system" ? pt() : t
    }

    function de(t) {
        document.documentElement.setAttribute(eo, t)
    }
    async function gt(t) {
        let e = await Ke(),
            o = _e(e);
        de(o);
        let r = window.matchMedia(dt),
            i = () => {
                e === "system" && (o = pt(), de(o), t?.(o, e))
            };
        r.addEventListener("change", i);
        let l = Ve(d => {
            d !== e && (e = d, o = _e(e), de(o), t?.(o, e))
        });
        return {
            get preference() {
                return e
            },
            get resolved() {
                return o
            },
            setPreference: async d => {
                e = d, o = _e(e), de(o), await ze(e), t?.(o, e)
            },
            destroy: () => {
                r.removeEventListener("change", i), l()
            }
        }
    }

    function n(t, e = {}, o = []) {
        let r = document.createElement(t),
            {
                className: i,
                style: l,
                dataset: m,
                attrs: g,
                onClick: d,
                ...h
            } = e;
        if (i && (r.className = i), l && Object.assign(r.style, l), m)
            for (let [f, x] of Object.entries(m)) r.dataset[f] = x;
        if (g)
            for (let [f, x] of Object.entries(g)) r.setAttribute(f, x);
        d && r.addEventListener("click", f => d(f)), Object.assign(r, h);
        for (let f of o) f == null || f === !1 || r.append(typeof f == "string" ? document.createTextNode(f) : f);
        return r
    }

    function pe(t) {
        for (; t.firstChild;) t.firstChild.remove()
    }
    var to = {
            sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.55 1.55M17.55 17.55l1.55 1.55M3 12h2.2M18.8 12H21M4.9 19.1l1.55-1.55M17.55 6.45l1.55-1.55"/>',
            moon: '<path d="M20.2 14.3A8.2 8.2 0 1 1 9.7 3.8a6.6 6.6 0 0 0 10.5 10.5Z"/>',
            plus: '<path d="M12 5v14M5 12h14"/>',
            trash: '<path d="M4 7h16M9.5 7V5.2a1.2 1.2 0 0 1 1.2-1.2h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.7 12.1A2 2 0 0 0 9.2 21h5.6a2 2 0 0 0 2-1.9L18 7"/>',
            externalLink: '<path d="M9 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3M14 4h6v6M20 4 11 13"/>',
            arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
            chevronRight: '<path d="M9 5l7 7-7 7"/>',
            check: '<path d="M4 12.5l5 5L20 7"/>',
            x: '<path d="M6 6l12 12M18 6 6 18"/>',
            download: '<path d="M12 4v11M7.5 11.5 12 16l4.5-4.5M5 19.5h14"/>',
            upload: '<path d="M12 20V9M7.5 13.5 12 9l4.5 4.5M5 4.5h14"/>',
            search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.35-4.35"/>',
            pin: '<path d="M12 3c3.3 0 6 2.6 6 5.9 0 4.4-6 12.1-6 12.1S6 13.3 6 8.9C6 5.6 8.7 3 12 3Z"/><circle cx="12" cy="8.8" r="2.2"/>',
            pencil: '<path d="M4 20l.9-3.9L16.6 4.4a1.5 1.5 0 0 1 2.1 0l1 1a1.5 1.5 0 0 1 0 2.1L8 19.1 4 20Z"/>',
            folderOpen: '<path d="M3.5 8V6.2A1.7 1.7 0 0 1 5.2 4.5h4l1.8 2h7.3a1.7 1.7 0 0 1 1.7 1.7v.8M3.5 8h16.8a1 1 0 0 1 1 1.2l-1.6 8a1.7 1.7 0 0 1-1.7 1.3H5.3a1.7 1.7 0 0 1-1.7-1.4L2 9.3A1 1 0 0 1 3 8Z"/>',
            link: '<path d="M9.5 14.5 14.5 9.5M10.8 6.8l1.1-1.1a3.5 3.5 0 0 1 5 5l-1.1 1.1M13.2 17.2l-1.1 1.1a3.5 3.5 0 0 1-5-5l1.1-1.1"/>',
            alertTriangle: '<path d="M12 4.5 21 19.5H3L12 4.5Z"/><path d="M12 10v4.2M12 17.2h.01"/>',
            info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.7h.01"/>',
            sliders: '<path d="M5 6h6M15 6h4M5 12h10M19 12h0M5 18h2M11 18h8"/><circle cx="13" cy="6" r="1.6"/><circle cx="17" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/>',
            settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 12.9v-1.8l-2-.4a5.8 5.8 0 0 0-.6-1.4l1.1-1.7-1.3-1.3-1.7 1.1a5.8 5.8 0 0 0-1.4-.6l-.4-2h-1.8l-.4 2a5.8 5.8 0 0 0-1.4.6L8 6.3 6.7 7.6l1.1 1.7a5.8 5.8 0 0 0-.6 1.4l-2 .4v1.8l2 .4c.13.5.33.98.6 1.4l-1.1 1.7 1.3 1.3 1.7-1.1c.42.27.9.47 1.4.6l.4 2h1.8l.4-2c.5-.13.98-.33 1.4-.6l1.7 1.1 1.3-1.3-1.1-1.7c.27-.42.47-.9.6-1.4Z"/>',
            copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
            logo: '<path d="M6 3.5h9.5L18.5 6.5V20.5H6Z"/><path d="M15.3 3.5V7h3.5"/><path d="M9 12.5l2 2 4-4.5"/>'
        },
        oo = new DOMParser;

    function v(t, e = "") {
        let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${to[t]}</svg>`,
            i = oo.parseFromString(o, "image/svg+xml").documentElement;
        return e && i.setAttribute("class", e), i.setAttribute("aria-hidden", "true"), i.setAttribute("focusable", "false"), i
    }

    function ut(t, e = "") {
        let r = document.documentElement.dir === "rtl" ? `icon-flip-rtl ${e}`.trim() : e;
        return v(t, r)
    }

    function X(t) {
        let e = [v(t.iconName, "empty-state__icon"), n("p", {
            className: "empty-state__title"
        }, [t.title]), n("p", {
            className: "empty-state__description"
        }, [t.description])];
        return t.actionLabel && t.onAction && e.push(n("button", {
            className: "btn btn--secondary btn--sm",
            type: "button",
            onClick: t.onAction
        }, [t.actionLabel])), n("div", {
            className: "empty-state"
        }, e)
    }
    var ro = {
        indigo: "color.indigo",
        sky: "color.sky",
        violet: "color.violet",
        emerald: "color.emerald",
        amber: "color.amber",
        rose: "color.rose",
        slate: "color.slate"
    };

    function ft(t) {
        let e = t.selected,
            o = ne.map(r => {
                let i = a(ro[r]),
                    l = n("button", {
                        type: "button",
                        className: "color-picker__swatch",
                        dataset: {
                            color: r
                        },
                        attrs: {
                            "aria-pressed": String(r === e),
                            "aria-label": i,
                            title: i
                        }
                    }, [r === e ? v("check") : ""]);
                return l.addEventListener("click", () => {
                    e = r, t.onSelect(r);
                    for (let m of o) {
                        let g = m.dataset.color;
                        m.setAttribute("aria-pressed", String(g === e)), pe(m), g === e && m.append(v("check"))
                    }
                }), l
            });
        return n("div", {
            className: "color-picker",
            attrs: {
                role: "group",
                "aria-label": a("colorPickerAriaLabel")
            }
        }, o)
    }

    function Se(t) {
        let e = t.initialColor,
            o = n("input", {
                className: "input",
                type: "text",
                id: "collection-name-input",
                placeholder: a("collectionNamePlaceholder"),
                maxLength: 60,
                value: t.initialName ?? "",
                attrs: {
                    autocomplete: "off"
                }
            }),
            r = n("p", {
                className: "field__hint field__hint--error",
                attrs: {
                    role: "alert"
                }
            }, []);
        r.style.display = "none";
        let i = n("form", {
            className: "collection-form"
        }, [n("div", {
            className: "field"
        }, [n("label", {
            className: "field__label",
            htmlFor: "collection-name-input"
        }, [a("collectionNameLabel")]), o, r]), n("div", {
            className: "field"
        }, [n("span", {
            className: "field__label"
        }, [a("collectionColorLabel")]), ft({
            selected: e,
            onSelect: l => {
                e = l
            }
        })]), n("div", {
            className: "dialog__actions"
        }, [n("button", {
            type: "button",
            className: "btn btn--secondary",
            onClick: () => t.onCancel()
        }, [a("cancel")]), n("button", {
            type: "submit",
            className: "btn btn--primary"
        }, [t.submitLabel])])]);
        return i.addEventListener("submit", l => {
            l.preventDefault();
            let m = o.value.trim();
            if (!m) {
                r.textContent = a("collectionNameRequired"), r.style.display = "block", o.focus();
                return
            }
            t.onSubmit({
                name: m,
                color: e
            })
        }), i
    }
    var vt = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function U(t, e) {
        let o = document.activeElement,
            r = `dialog-title-${Math.random().toString(36).slice(2,8)}`,
            i = n("div", {
                className: `dialog${e.size?` dialog--${e.size}`:""}`,
                attrs: {
                    role: "dialog",
                    "aria-modal": "true",
                    "aria-labelledby": r
                }
            }, [n("div", {
                className: "dialog__header"
            }, [n("h2", {
                className: "dialog__title",
                id: r
            }, [e.title])]), e.body]),
            l = n("div", {
                className: "overlay"
            }, [i]);
        t.append(l);

        function m() {
            document.removeEventListener("keydown", g), l.remove(), e.onClose?.(), o?.focus?.()
        }

        function g(d) {
            if (d.key === "Escape") {
                d.preventDefault(), m();
                return
            }
            if (d.key !== "Tab") return;
            let h = Array.from(i.querySelectorAll(vt));
            if (h.length === 0) return;
            let f = h[0],
                x = h[h.length - 1],
                T = document.activeElement;
            d.shiftKey && T === f ? (d.preventDefault(), x.focus()) : !d.shiftKey && T === x && (d.preventDefault(), f.focus())
        }
        return l.addEventListener("mousedown", d => {
            d.target === l && e.closeOnOverlayClick !== !1 && m()
        }), document.addEventListener("keydown", g), requestAnimationFrame(() => {
            i.querySelector(vt)?.focus()
        }), {
            element: i,
            close: m
        }
    }

    function Ne(t, e) {
        return new Promise(o => {
            let r = !1,
                i = g => {
                    r || (r = !0, o(g), m.close())
                },
                l = n("div", {
                    className: "confirm-dialog"
                }, [n("div", {
                    className: "confirm-dialog__icon"
                }, [v("alertTriangle")]), n("p", {
                    className: "confirm-dialog__message"
                }, [e.message]), n("div", {
                    className: "dialog__actions"
                }, [n("button", {
                    type: "button",
                    className: "btn btn--secondary",
                    onClick: () => i(!1)
                }, [e.cancelLabel ?? a("cancel")]), n("button", {
                    type: "button",
                    className: e.danger ? "btn btn--danger" : "btn btn--primary",
                    onClick: () => i(!0)
                }, [e.confirmLabel ?? a("confirm")])])]),
                m = U(t, {
                    title: e.title,
                    body: l,
                    onClose: () => i(!1)
                })
        })
    }

    function ht(t, e) {
        let o = n("textarea", {
                className: "textarea",
                id: "item-note-textarea",
                maxLength: 500,
                value: e.initialNote,
                attrs: {
                    "aria-label": a("editNoteDialogTitle")
                }
            }),
            r = n("form", {
                className: "collection-form"
            }, [n("div", {
                className: "field"
            }, [n("label", {
                className: "field__label",
                htmlFor: "item-note-textarea"
            }, [a("editNoteLabel", {
                title: e.itemTitle
            })]), o]), n("div", {
                className: "dialog__actions"
            }, [n("button", {
                type: "button",
                className: "btn btn--secondary",
                onClick: () => i.close()
            }, [a("cancel")]), n("button", {
                type: "submit",
                className: "btn btn--primary"
            }, [a("save")])])]);
        r.addEventListener("submit", l => {
            l.preventDefault(), e.onSave(o.value.trim()), i.close()
        });
        let i = U(t, {
            title: a("editNoteDialogTitle"),
            body: r
        })
    }
    var io = 3200,
        ge = class {
            stack;
            constructor(e) {
                this.stack = n("div", {
                    className: "toast-stack",
                    attrs: {
                        role: "status",
                        "aria-live": "polite"
                    }
                }), e.append(this.stack)
            }
            show(e, o = "info") {
                let r = o === "success" ? "check" : o === "error" ? "alertTriangle" : "info",
                    i = n("div", {
                        className: `toast toast--${o}`
                    }, [v(r), n("span", {}, [e])]);
                this.stack.append(i);
                let l = () => i.remove(),
                    m = setTimeout(l, io);
                i.addEventListener("click", () => {
                    clearTimeout(m), l()
                })
            }
            destroy() {
                this.stack.remove()
            }
        };

    function xt(t) {
        let e = t.resolvedTheme === "dark",
            o = t.locale === "ar" ? "EN" : "\u0639";
        return n("header", {
            className: "options__topbar"
        }, [n("div", {
            className: "options__brand"
        }, [n("span", {
            className: "options__logo"
        }, [v("logo")]), n("h1", {
            className: "options__title"
        }, [a("optionsTitle")])]), n("div", {
            className: "options__topbar-actions"
        }, [n("button", {
            type: "button",
            className: "btn btn--secondary btn--sm",
            onClick: () => t.onImport()
        }, [v("upload"), a("importAction")]), n("button", {
            type: "button",
            className: "btn btn--secondary btn--sm",
            onClick: () => t.onExportAll()
        }, [v("download"), a("exportAllAction")]), n("button", {
            type: "button",
            className: "btn btn--icon btn--lang",
            attrs: {
                "aria-label": a("languageSwitchAriaLabel")
            },
            onClick: () => t.onToggleLocale()
        }, [o]), n("button", {
            type: "button",
            className: "btn btn--icon",
            attrs: {
                "aria-label": e ? a("themeSwitchToLight") : a("themeSwitchToDark")
            },
            onClick: () => t.onToggleTheme()
        }, [v(e ? "sun" : "moon")])])])
    }

    function bt(t) {
        let {
            collection: e
        } = t, r = [n("button", {
            type: "button",
            className: "collection-row__main",
            attrs: {
                "aria-current": t.selected ? "true" : "false"
            },
            onClick: () => t.onOpen()
        }, [n("span", {
            className: "color-dot",
            dataset: {
                color: e.color
            }
        }), n("span", {
            className: "collection-row__name"
        }, [e.name]), n("span", {
            className: "count-badge"
        }, [String(e.items.length)]), n("span", {
            className: "collection-row__chevron"
        }, [ut("chevronRight")])])];
        return t.actions && t.actions.length > 0 && r.push(n("span", {
            className: "collection-row__actions"
        }, t.actions.map(i => n("button", {
            type: "button",
            className: `btn btn--icon btn--sm${i.active?" is-active":""}`,
            attrs: {
                "aria-label": i.label,
                title: i.label
            },
            onClick: l => {
                l.stopPropagation(), i.onClick()
            }
        }, [v(i.iconName)])))), n("div", {
            className: `collection-row${t.selected?" collection-row--selected":""}`
        }, r)
    }

    // --- Sidebar: search + collections list --------------------------------
    // The search <input> is built once (buildSidebarShell) and stays mounted
    // for the lifetime of the options page. Re-renders triggered by typing,
    // by selecting a collection, or by a storage change event only refresh
    // the collections list (renderSidebarCollections) - the input node
    // itself is never re-created, so it never loses focus or caret position
    // while the user is typing a query.
    var sidebarAsideEl = null,
        sidebarSearchInputEl = null,
        sidebarListEl = null,
        optionsMainEl = null;

    function buildSidebarShell(t) {
        let e = n("input", {
            type: "search",
            className: "input",
            placeholder: a("searchPlaceholder"),
            value: t.searchQuery,
            attrs: {
                "aria-label": a("searchAriaLabel")
            }
        });
        e.addEventListener("input", () => t.onSearchChange(e.value)), sidebarSearchInputEl = e;
        let o = n("div", {
            className: "options__collections",
            attrs: {
                role: "list"
            }
        }, []);
        return sidebarListEl = o, n("aside", {
            className: "options__sidebar"
        }, [n("div", {
            className: "options__search"
        }, [v("search"), e]), o, n("div", {
            className: "options__sidebar-footer"
        }, [n("button", {
            type: "button",
            className: "btn btn--primary btn--sm btn--block",
            onClick: () => t.onCreateCollection()
        }, [v("plus"), a("newCollectionAction")])])])
    }

    function renderSidebarCollections(t) {
        sidebarListEl && (pe(sidebarListEl), sidebarListEl.append(...t.collections.map(r => bt({
            collection: r,
            selected: r.id === t.selectedCollectionId,
            onOpen: () => t.onSelectCollection(r.id),
            actions: [{
                iconName: "pin",
                label: r.pinned ? a("unpinCollection") : a("pinCollection"),
                active: r.pinned,
                onClick: () => t.onTogglePin(r)
            }, {
                iconName: "pencil",
                label: a("editCollectionAction"),
                onClick: () => t.onEditCollection(r)
            }, {
                iconName: "trash",
                label: a("deleteCollectionAction"),
                onClick: () => t.onDeleteCollection(r)
            }]
        }))))
    }

    function Ct(t, e) {
        if (me(e)) {
            let o = n("img", {
                className: "favicon",
                src: e,
                alt: "",
                loading: "lazy"
            });
            return o.addEventListener("error", () => {
                o.replaceWith(At(t))
            }, {
                once: !0
            }), o
        }
        return At(t)
    }

    function At(t) {
        let {
            letter: e,
            backgroundColor: o
        } = rt(t);
        return n("span", {
            className: "favicon-fallback",
            style: {
                backgroundColor: o
            },
            attrs: {
                "aria-hidden": "true"
            }
        }, [e])
    }

    function ue(t) {
        let {
            item: e
        } = t, o = [n("p", {
            className: "item-row__title"
        }, [e.title]), n("p", {
            className: "item-row__host"
        }, [W(e.url)])];
        e.note && o.push(n("p", {
            className: "item-row__note"
        }, [e.note]));
        let r = n("a", {
                className: "item-row__link",
                href: e.url,
                target: "_blank",
                rel: "noopener noreferrer",
                attrs: {
                    title: e.title
                }
            }, [Ct(e.url, e.faviconUrl), n("span", {
                className: "item-row__body"
            }, o)]),
            i = [];
        return t.onEditNote && i.push(n("button", {
            type: "button",
            className: "btn btn--icon",
            attrs: {
                "aria-label": a("editNoteAriaLabel", {
                    title: e.title
                })
            },
            onClick: () => t.onEditNote?.()
        }, [v("pencil")])), i.push(n("button", {
            type: "button",
            className: "btn btn--icon",
            attrs: {
                "aria-label": a("deleteItemAriaLabel", {
                    title: e.title
                })
            },
            onClick: () => t.onDelete()
        }, [v("trash")])), n("div", {
            className: "item-row"
        }, [r, n("div", {
            className: "item-row__actions"
        }, i)])
    }

    function wt(t) {
        let {
            collection: e
        } = t, o = n("div", {
            className: "options__collection-header"
        }, [n("h2", {
            className: "options__collection-title"
        }, [n("span", {
            className: "color-dot",
            dataset: {
                color: e.color
            }
        }), n("span", {}, [e.name]), n("span", {
            className: "count-badge"
        }, [String(e.items.length)])]), n("div", {
            className: "options__collection-actions"
        }, [n("button", {
            type: "button",
            className: "btn btn--secondary btn--sm",
            disabled: e.items.length === 0,
            onClick: () => t.onOpenAll()
        }, [v("externalLink"), a("openAllAction")]), n("button", {
            type: "button",
            className: "btn btn--secondary btn--sm",
            disabled: e.items.length === 0,
            onClick: () => t.onExport()
        }, [v("download"), a("exportAction")]), n("button", {
            type: "button",
            className: "btn btn--danger btn--sm",
            onClick: () => t.onDeleteCollection()
        }, [v("trash"), a("deleteCollectionAction")])])]), r = e.items.length === 0 ? X({
            iconName: "link",
            title: a("emptyItemsTitle"),
            description: a("emptyItemsDescriptionOptions")
        }) : n("div", {
            className: "options__items-grid"
        }, [...e.items].sort((i, l) => i.order - l.order).map(i => ue({
            item: i,
            onDelete: () => t.onDeleteItem(i.id),
            onEditNote: () => t.onEditItemNote(i.id)
        })));
        return n("div", {
            className: "collection-detail"
        }, [o, r])
    }

    function kt(t) {
        return t.matches.length === 0 ? X({
            iconName: "search",
            title: a("searchResultsEmptyTitle"),
            description: a("searchResultsEmptyDescription", {
                query: t.query
            })
        }) : n("div", {
            className: "collection-detail"
        }, [n("div", {
            className: "options__collection-header"
        }, [n("h2", {
            className: "options__collection-title"
        }, [n("span", {}, [a("searchResultsTitle")]), n("span", {
            className: "count-badge"
        }, [String(t.matches.length)])])]), n("div", {
            className: "options__items-grid"
        }, t.matches.map(({
            item: e,
            collection: o
        }) => n("div", {
            className: "search-result"
        }, [n("span", {
            className: "options__search-results-tag"
        }, [a("searchResultsInCollection", {
            collection: o.name
        })]), ue({
            item: e,
            onDelete: () => t.onDeleteItem(o.id, e.id),
            onEditNote: () => t.onEditItemNote(o.id, e.id)
        })])))])
    }

    function Et(t, e) {
        let o = null,
            r = "merge",
            i = n("input", {
                type: "file",
                id: "import-file-input",
                className: "input",
                accept: "application/json,.json"
            }),
            l = n("div", {
                className: "import-preview"
            }, []);
        l.style.display = "none";
        let m = [],
            g = n("div", {
                className: "option-card-group",
                attrs: {
                    role: "radiogroup",
                    "aria-label": a("importModeGroupAriaLabel")
                }
            }, [d("merge", a("importModeMergeTitle"), a("importModeMergeDesc"), !0), d("replace", a("importModeReplaceTitle"), a("importModeReplaceDesc"), !1)]);
        g.style.display = "none";

        function d(A, C, L, _) {
            let j = n("input", {
                    type: "radio",
                    name: "import-mode",
                    value: A,
                    checked: _
                }),
                S = n("label", {
                    className: `option-card${_?" is-selected":""}`
                }, [j, n("span", {}, [n("span", {
                    className: "option-card__title"
                }, [C]), n("span", {
                    className: "option-card__desc"
                }, [L])])]);
            return j.addEventListener("change", () => {
                r = A;
                for (let s of m) {
                    let c = s.querySelector("input");
                    s.classList.toggle("is-selected", c === j)
                }
            }), m.push(S), S
        }
        let h = n("button", {
            type: "button",
            className: "btn btn--primary",
            disabled: !0,
            onClick: x
        }, [a("importAction")]);
        i.addEventListener("change", () => {
            let A = i.files?.[0];
            if (!A) return;
            let C = new FileReader;
            C.onload = () => {
                try {
                    let L = String(C.result ?? "");
                    o = ct(L), f(o), l.style.display = "flex", g.style.display = "flex", h.disabled = !1
                } catch (L) {
                    o = null, h.disabled = !0, l.style.display = "none", g.style.display = "none", e.onError(L instanceof Error ? L.message : a("importErrorReadFailed"))
                }
            }, C.onerror = () => e.onError(a("importErrorDiskReadFailed")), C.readAsText(A)
        });

        function f(A) {
            l.replaceChildren();
            let C = A.collections.reduce((L, _) => L + _.items.length, 0);
            l.append(v("folderOpen"), n("div", {}, [n("p", {
                className: "import-preview__summary"
            }, [a("importPreviewSummary", {
                collections: A.collections.length,
                items: C
            })]), A.skippedCollections + A.skippedItems > 0 ? n("p", {
                className: "import-preview__warning"
            }, [a("importPreviewWarning", {
                collections: A.skippedCollections,
                items: A.skippedItems
            })]) : n("p", {}, [])]))
        }

        function x() {
            o && (e.onConfirm(o, r), E.close())
        }
        let T = n("div", {
                className: "import-dialog"
            }, [n("div", {
                className: "field"
            }, [n("label", {
                className: "field__label",
                htmlFor: "import-file-input"
            }, [a("importFileLabel")]), i]), l, g, n("div", {
                className: "dialog__actions"
            }, [n("button", {
                type: "button",
                className: "btn btn--secondary",
                onClick: () => E.close()
            }, [a("cancel")]), h])]),
            E = U(t, {
                title: a("importDialogTitle"),
                body: T,
                size: "lg"
            })
    }
    var St = document.getElementById("app");
    if (!St) throw new Error("\u0639\u0646\u0635\u0631 \u0627\u0644\u062C\u0630\u0631 #app \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A options.html");
    var Me = n("div"),
        fe = n("div", {
            className: "options__body"
        });
    St.append(n("div", {
        className: "options"
    }, [Me, fe]));
    var R = new ge(document.body),
        y = {
            collections: [],
            selectedCollectionId: null,
            searchQuery: ""
        },
        ve, he;

    function re() {
        let t = xt({
            resolvedTheme: ve.resolved,
            locale: he.locale,
            onToggleTheme: () => {
                ve.setPreference(ve.resolved === "dark" ? "light" : "dark").then(re)
            },
            onToggleLocale: () => {
                he.setPreference(he.locale === "ar" ? "en" : "ar").then(() => {
                    re(), sidebarAsideEl = null, Q()
                })
            },
            onImport: () => Et(document.body, {
                onConfirm: (e, o) => void fo(e, o),
                onError: e => R.show(e, "error")
            }),
            onExportAll: () => uo()
        });
        Me.replaceWith(t), Me = t
    }

    function ao(t) {
        let e = t.trim().toLowerCase();
        if (!e) return [];
        let o = [];
        for (let r of y.collections)
            for (let i of r.items)`${i.title} ${W(i.url)} ${i.note??""}`.toLowerCase().includes(e) && o.push({
                item: i,
                collection: r
            });
        return o.sort((r, i) => i.item.createdAt - r.item.createdAt)
    }

    function Q() {
        sidebarAsideEl || (sidebarAsideEl = buildSidebarShell({
            searchQuery: y.searchQuery,
            onSearchChange: e => {
                y.searchQuery = e, Q()
            },
            onCreateCollection: () => Nt()
        }), optionsMainEl = n("main", {
            className: "options__main"
        }, []), fe.append(sidebarAsideEl, optionsMainEl)), renderSidebarCollections({
            collections: y.collections,
            selectedCollectionId: y.selectedCollectionId,
            onSelectCollection: e => {
                y.selectedCollectionId = e, y.searchQuery = "", sidebarSearchInputEl && (sidebarSearchInputEl.value = ""), Q()
            },
            onTogglePin: e => void co(e),
            onEditCollection: e => so(e),
            onDeleteCollection: e => void It(e)
        }), pe(optionsMainEl), optionsMainEl.append(lo())
    }

    function lo() {
        if (y.searchQuery.trim()) return kt({
            query: y.searchQuery.trim(),
            matches: ao(y.searchQuery),
            onDeleteItem: (e, o) => void Tt(e, o),
            onEditItemNote: (e, o) => Lt(e, o)
        });
        let t = y.collections.find(e => e.id === y.selectedCollectionId);
        return t ? wt({
            collection: t,
            onOpenAll: () => void po(t),
            onExport: () => go(t),
            onDeleteCollection: () => void It(t),
            onDeleteItem: e => void Tt(t.id, e),
            onEditItemNote: e => Lt(t.id, e)
        }) : X({
            iconName: "folderOpen",
            title: a("noCollectionSelectedTitle"),
            description: a("noCollectionSelectedDescription"),
            actionLabel: a("emptyCollectionsAction"),
            onAction: () => Nt()
        })
    }

    function Nt() {
        let t = Se({
                initialColor: "indigo",
                submitLabel: a("createAction"),
                onSubmit: ({
                    name: o,
                    color: r
                }) => {
                    (async () => {
                        try {
                            let i = await Qe(o, r);
                            y.selectedCollectionId = i.id, y.searchQuery = "", sidebarSearchInputEl && (sidebarSearchInputEl.value = ""), e.close(), R.show(a("toastCollectionCreated"), "success")
                        } catch (i) {
                            R.show(i instanceof Error ? i.message : a("toastCollectionCreateFailed"), "error")
                        }
                    })()
                },
                onCancel: () => e.close()
            }),
            e = U(document.body, {
                title: a("newCollectionTitle"),
                body: t
            })
    }

    function so(t) {
        let e = Se({
                initialName: t.name,
                initialColor: t.color,
                submitLabel: a("saveChangesAction"),
                onSubmit: ({
                    name: r,
                    color: i
                }) => {
                    (async () => {
                        try {
                            await Je(t.id, r), await Ze(t.id, i), o.close(), R.show(a("toastCollectionSaved"), "success")
                        } catch (l) {
                            R.show(l instanceof Error ? l.message : a("toastCollectionSaveFailed"), "error")
                        }
                    })()
                },
                onCancel: () => o.close()
            }),
            o = U(document.body, {
                title: a("editCollectionTitle"),
                body: e
            })
    }
    async function co(t) {
        await Ye(t.id)
    }
    async function It(t) {
        await Ne(document.body, {
            title: a("deleteCollectionDialogTitle"),
            message: a("deleteCollectionDialogMessage", {
                name: t.name,
                count: t.items.length
            }),
            confirmLabel: a("deleteCollectionConfirmLabel"),
            danger: !0
        }) && (await et(t.id), y.selectedCollectionId === t.id && (y.selectedCollectionId = y.collections.find(o => o.id !== t.id)?.id ?? null), R.show(a("toastCollectionDeleted"), "success"))
    }
    async function Tt(t, e) {
        await ot(t, e), R.show(a("toastItemDeleted"), "success")
    }

    function Lt(t, e) {
        let o = y.collections.find(i => i.id === t),
            r = o?.items.find(i => i.id === e);
        !o || !r || ht(document.body, {
            itemTitle: r.title,
            initialNote: r.note ?? "",
            onSave: i => {
                tt(t, e, i).then(() => R.show(a("toastNoteSaved"), "success")).catch(l => R.show(l instanceof Error ? l.message : a("toastNoteSaveFailed"), "error"))
            }
        })
    }
    var mo = 8;
    async function po(t) {
        if (!(t.items.length > mo && !await Ne(document.body, {
                title: a("openAllDialogTitle"),
                message: a("openAllDialogMessage", {
                    count: t.items.length
                }),
                confirmLabel: a("openAllAction")
            })))
            for (let e of t.items) await _t.default.tabs.create({
                url: e.url,
                active: !1
            })
    }

    function go(t) {
        let e = Ee([t]),
            o = Te(e),
            r = t.name.replace(/[^\p{L}\p{N}\- _]/gu, "").trim() || a("exportFilenameFallback");
        Le(`keepit-${r}.json`, o), R.show(a("toastExportDownloaded"), "success")
    }

    function uo() {
        if (y.collections.length === 0) {
            R.show(a("toastNoCollectionsToExport"), "info");
            return
        }
        let t = Ee(y.collections),
            e = Te(t),
            o = new Date().toISOString().slice(0, 10);
        Le(`keepit-export-${o}.json`, e), R.show(a("toastExportDownloaded"), "success")
    }
    async function fo(t, e) {
        await mt(t, e), R.show(e === "replace" ? a("toastImportReplaced") : a("toastImportMerged"), "success")
    }
    async function vo() {
        ve = await gt(() => re()), he = await Be(() => {
            re(), Q()
        }), re();
        let [t, e] = await Promise.all([Xe(), P()]);
        y.collections = t;
        let o = t.some(r => r.id === e.lastUsedCollectionId);
        y.selectedCollectionId = o ? e.lastUsedCollectionId : t[0]?.id ?? null, Q(), De(r => {
            y.collections = [...r.collections].sort((i, l) => i.pinned !== l.pinned ? i.pinned ? -1 : 1 : l.updatedAt - i.updatedAt), y.selectedCollectionId && !y.collections.some(i => i.id === y.selectedCollectionId) && (y.selectedCollectionId = y.collections[0]?.id ?? null), Q()
        })
    }
    vo();
})();