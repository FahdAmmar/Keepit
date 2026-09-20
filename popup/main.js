"use strict";
(() => {
    var gt = Object.create;
    var be = Object.defineProperty;
    var pt = Object.getOwnPropertyDescriptor;
    var ut = Object.getOwnPropertyNames;
    var ft = Object.getPrototypeOf,
        vt = Object.prototype.hasOwnProperty;
    var ht = (t, e) => () => (e || t((e = {
        exports: {}
    }).exports, e), e.exports);
    var bt = (t, e, o, i) => {
        if (e && typeof e == "object" || typeof e == "function")
            for (let a of ut(e)) !vt.call(t, a) && a !== o && be(t, a, {
                get: () => e[a],
                enumerable: !(i = pt(e, a)) || i.enumerable
            });
        return t
    };
    var te = (t, e, o) => (o = t != null ? gt(ft(t)) : {}, bt(e || !t || !t.__esModule ? be(o, "default", {
        value: t,
        enumerable: !0
    }) : o, t));
    var q = ht((oe, xe) => {
        (function(t, e) {
            if (typeof define == "function" && define.amd) define("webextension-polyfill", ["module"], e);
            else if (typeof oe < "u") e(xe);
            else {
                var o = {
                    exports: {}
                };
                e(o), t.browser = o.exports
            }
        })(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : oe, function(t) {
            "use strict";
            if (!(globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.id)) throw new Error("This script should only be loaded in a browser extension.");
            if (globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id) t.exports = globalThis.browser;
            else {
                let e = "The message port closed before a response was received.",
                    o = i => {
                        let a = {
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
                        if (Object.keys(a).length === 0) throw new Error("api-metadata.json has not been included in browser-polyfill");
                        class s extends WeakMap {
                            constructor(c, g = void 0) {
                                super(g), this.createItem = c
                            }
                            get(c) {
                                return this.has(c) || this.set(c, this.createItem(c)), super.get(c)
                            }
                        }
                        let p = l => l && typeof l == "object" && typeof l.then == "function",
                            h = (l, c) => (...g) => {
                                i.runtime.lastError ? l.reject(new Error(i.runtime.lastError.message)) : c.singleCallbackArg || g.length <= 1 && c.singleCallbackArg !== !1 ? l.resolve(g[0]) : l.resolve(g)
                            },
                            f = l => l == 1 ? "argument" : "arguments",
                            E = (l, c) => function(u, ...A) {
                                if (A.length < c.minArgs) throw new Error(`Expected at least ${c.minArgs} ${f(c.minArgs)} for ${l}(), got ${A.length}`);
                                if (A.length > c.maxArgs) throw new Error(`Expected at most ${c.maxArgs} ${f(c.maxArgs)} for ${l}(), got ${A.length}`);
                                return new Promise((y, T) => {
                                    if (c.fallbackToNoCallback) try {
                                        u[l](...A, h({
                                            resolve: y,
                                            reject: T
                                        }, c))
                                    } catch (d) {
                                        console.warn(`${l} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `, d), u[l](...A), c.fallbackToNoCallback = !1, c.noCallback = !0, y()
                                    } else c.noCallback ? (u[l](...A), y()) : u[l](...A, h({
                                        resolve: y,
                                        reject: T
                                    }, c))
                                })
                            },
                            b = (l, c, g) => new Proxy(c, {
                                apply(u, A, y) {
                                    return g.call(A, l, ...y)
                                }
                            }),
                            S = Function.call.bind(Object.prototype.hasOwnProperty),
                            I = (l, c = {}, g = {}) => {
                                let u = Object.create(null),
                                    A = {
                                        has(T, d) {
                                            return d in l || d in u
                                        },
                                        get(T, d, k) {
                                            if (d in u) return u[d];
                                            if (!(d in l)) return;
                                            let x = l[d];
                                            if (typeof x == "function")
                                                if (typeof c[d] == "function") x = b(l, l[d], c[d]);
                                                else if (S(g, d)) {
                                                let P = E(d, g[d]);
                                                x = b(l, l[d], P)
                                            } else x = x.bind(l);
                                            else if (typeof x == "object" && x !== null && (S(c, d) || S(g, d))) x = I(x, c[d], g[d]);
                                            else if (S(g, "*")) x = I(x, c[d], g["*"]);
                                            else return Object.defineProperty(u, d, {
                                                configurable: !0,
                                                enumerable: !0,
                                                get() {
                                                    return l[d]
                                                },
                                                set(P) {
                                                    l[d] = P
                                                }
                                            }), x;
                                            return u[d] = x, x
                                        },
                                        set(T, d, k, x) {
                                            return d in u ? u[d] = k : l[d] = k, !0
                                        },
                                        defineProperty(T, d, k) {
                                            return Reflect.defineProperty(u, d, k)
                                        },
                                        deleteProperty(T, d) {
                                            return Reflect.deleteProperty(u, d)
                                        }
                                    },
                                    y = Object.create(l);
                                return new Proxy(y, A)
                            },
                            Q = l => ({
                                addListener(c, g, ...u) {
                                    c.addListener(l.get(g), ...u)
                                },
                                hasListener(c, g) {
                                    return c.hasListener(l.get(g))
                                },
                                removeListener(c, g) {
                                    c.removeListener(l.get(g))
                                }
                            }),
                            ct = new s(l => typeof l != "function" ? l : function(g) {
                                let u = I(g, {}, {
                                    getContent: {
                                        minArgs: 0,
                                        maxArgs: 0
                                    }
                                });
                                l(u)
                            }),
                            ve = new s(l => typeof l != "function" ? l : function(g, u, A) {
                                let y = !1,
                                    T, d = new Promise(O => {
                                        T = function(L) {
                                            y = !0, O(L)
                                        }
                                    }),
                                    k;
                                try {
                                    k = l(g, u, T)
                                } catch (O) {
                                    k = Promise.reject(O)
                                }
                                let x = k !== !0 && p(k);
                                if (k !== !0 && !x && !y) return !1;
                                let P = O => {
                                    O.then(L => {
                                        A(L)
                                    }, L => {
                                        let ee;
                                        L && (L instanceof Error || typeof L.message == "string") ? ee = L.message : ee = "An unexpected error occurred", A({
                                            __mozWebExtensionPolyfillReject__: !0,
                                            message: ee
                                        })
                                    }).catch(L => {
                                        console.error("Failed to send onMessage rejected reply", L)
                                    })
                                };
                                return P(x ? k : d), !0
                            }),
                            dt = ({
                                reject: l,
                                resolve: c
                            }, g) => {
                                i.runtime.lastError ? i.runtime.lastError.message === e ? c() : l(new Error(i.runtime.lastError.message)) : g && g.__mozWebExtensionPolyfillReject__ ? l(new Error(g.message)) : c(g)
                            },
                            he = (l, c, g, ...u) => {
                                if (u.length < c.minArgs) throw new Error(`Expected at least ${c.minArgs} ${f(c.minArgs)} for ${l}(), got ${u.length}`);
                                if (u.length > c.maxArgs) throw new Error(`Expected at most ${c.maxArgs} ${f(c.maxArgs)} for ${l}(), got ${u.length}`);
                                return new Promise((A, y) => {
                                    let T = dt.bind(null, {
                                        resolve: A,
                                        reject: y
                                    });
                                    u.push(T), g.sendMessage(...u)
                                })
                            },
                            mt = {
                                devtools: {
                                    network: {
                                        onRequestFinished: Q(ct)
                                    }
                                },
                                runtime: {
                                    onMessage: Q(ve),
                                    onMessageExternal: Q(ve),
                                    sendMessage: he.bind(null, "sendMessage", {
                                        minArgs: 1,
                                        maxArgs: 3
                                    })
                                },
                                tabs: {
                                    sendMessage: he.bind(null, "sendMessage", {
                                        minArgs: 2,
                                        maxArgs: 3
                                    })
                                }
                            },
                            J = {
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
                        return a.privacy = {
                            network: {
                                "*": J
                            },
                            services: {
                                "*": J
                            },
                            websites: {
                                "*": J
                            }
                        }, I(i, mt, a)
                    };
                t.exports = o(chrome)
            }
        })
    });
    var fe = te(q(), 1);
    var Ae = "indigo",
        re = ["indigo", "sky", "violet", "emerald", "amber", "rose", "slate"];
    var w = te(q(), 1);
    var C = {
        STATE: "keepit:state",
        THEME: "keepit:theme",
        LOCALE: "keepit:locale"
    };

    function At() {
        return {
            schemaVersion: 1,
            collections: [],
            lastUsedCollectionId: null
        }
    }
    async function M() {
        return (await w.default.storage.local.get(C.STATE))[C.STATE] ?? At()
    }
    async function H(t) {
        await w.default.storage.local.set({
            [C.STATE]: t
        })
    }

    function ye(t) {
        let e = (o, i) => {
            if (i !== "local") return;
            let a = o[C.STATE];
            a && t(a.newValue)
        };
        return w.default.storage.onChanged.addListener(e), () => w.default.storage.onChanged.removeListener(e)
    }
    async function Ce() {
        return (await w.default.storage.local.get(C.LOCALE))[C.LOCALE] ?? "system"
    }
    async function we(t) {
        await w.default.storage.local.set({
            [C.LOCALE]: t
        })
    }

    function Te(t) {
        let e = (o, i) => {
            if (i !== "local") return;
            let a = o[C.LOCALE];
            a && t(a.newValue)
        };
        return w.default.storage.onChanged.addListener(e), () => w.default.storage.onChanged.removeListener(e)
    }
    async function ke() {
        return (await w.default.storage.local.get(C.THEME))[C.THEME] ?? "system"
    }
    async function Se(t) {
        await w.default.storage.local.set({
            [C.THEME]: t
        })
    }

    function Le(t) {
        let e = (o, i) => {
            if (i !== "local") return;
            let a = o[C.THEME];
            a && t(a.newValue)
        };
        return w.default.storage.onChanged.addListener(e), () => w.default.storage.onChanged.removeListener(e)
    }

    function ae() {
        return crypto.randomUUID()
    }
    var yt = new Set(["http:", "https:"]);

    function z(t) {
        try {
            let e = new URL(t);
            return yt.has(e.protocol)
        } catch {
            return !1
        }
    }

    function ie(t) {
        return t.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim()
    }

    function R(t) {
        try {
            return new URL(t).hostname.replace(/^www\./, "")
        } catch {
            return t
        }
    }
    var _e = {
        ar: "rtl",
        en: "ltr"
    };
    var ne = {
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
            refreshAriaLabel: "تحديث البيانات",
            refreshToastChanged: "تم تحديث البيانات من المتصفحات الأخرى",
            refreshToastUpToDate: "البيانات محدَّثة بالفعل",
            refreshToastError: "تعذّر التحديث، حاول مجددًا",
            quickAddTabUnavailable: "\u062A\u0639\u0630\u0651\u0631 \u0642\u0631\u0627\u0621\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0647\u0630\u0627 \u0627\u0644\u062A\u0628\u0648\u064A\u0628",
            quickAddSelectCollection: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
            quickAddSaved: "\u0645\u062D\u0641\u0648\u0638",
            quickAddAdd: "\u0625\u0636\u0627\u0641\u0629",
            quickAddShortcutHint: "\u0623\u0648 \u0627\u0636\u063A\u0637 {shortcut}",
            quickAddAlsoSavedIn: 'محفوظ أيضًا في "{name}"',
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
            moveItemAriaLabel: 'نقل "{title}"',
            moveItemDialogTitle: "نقل الموقع",
            moveItemTargetLabel: "نقل إلى",
            moveItemConfirmAction: "نقل",
            moveItemNoOtherCollections: "لا توجد مجموعة أخرى للنقل إليها",
            moveItemDuplicateHint: "تحتوي على هذا الرابط بالفعل",
            toastItemMoved: 'تم نقل الموقع إلى "{name}"',
            toastItemMoveFailed: "تعذر نقل الموقع",
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
            duplicateCollectionAction: "نسخ المجموعة",
            duplicateCollectionNameTemplate: "نسخة من {name}",
            toastCollectionDuplicated: 'تم نسخ المجموعة إلى "{name}"',
            toastCollectionDuplicateFailed: "تعذر نسخ المجموعة",
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
            refreshAriaLabel: "Refresh data",
            refreshToastChanged: "Data updated from other browsers",
            refreshToastUpToDate: "Data is already up to date",
            refreshToastError: "Couldn't refresh, try again",
            quickAddTabUnavailable: "Couldn't read this tab's info",
            quickAddSelectCollection: "Choose collection",
            quickAddSaved: "Saved",
            quickAddAdd: "Add",
            quickAddShortcutHint: "or press {shortcut}",
            quickAddAlsoSavedIn: 'Also saved in "{name}"',
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
            moveItemAriaLabel: 'Move "{title}"',
            moveItemDialogTitle: "Move site",
            moveItemTargetLabel: "Move to",
            moveItemConfirmAction: "Move",
            moveItemNoOtherCollections: "There's no other collection to move this to",
            moveItemDuplicateHint: "already has this link",
            toastItemMoved: 'Moved to "{name}"',
            toastItemMoveFailed: "Couldn't move the item",
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
            duplicateCollectionAction: "Duplicate collection",
            duplicateCollectionNameTemplate: "Copy of {name}",
            toastCollectionDuplicated: 'Duplicated as "{name}"',
            toastCollectionDuplicateFailed: "Couldn't duplicate the collection",
            duplicateCollectionAction: "Duplicate collection",
            duplicateCollectionNameTemplate: "Copy of {name}",
            toastCollectionDuplicated: 'Duplicated as "{name}"',
            toastCollectionDuplicateFailed: "Couldn't duplicate the collection",
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

    function Ct() {
        return ((typeof navigator < "u" ? navigator.language : "ar") || "ar").toLowerCase().startsWith("ar") ? "ar" : "en"
    }

    function le(t) {
        return t === "system" ? Ct() : t
    }

    function se(t) {
        document.documentElement.lang = t, document.documentElement.dir = _e[t]
    }
    var _ = "ar";

    function n(t, e) {
        let i = ne[_][t] ?? ne.ar[t] ?? t;
        if (e)
            for (let [a, s] of Object.entries(e)) i = i.replace(new RegExp(`\\{${a}\\}`, "g"), String(s));
        return i
    }
    async function Ne(t) {
        let e = await Ce();
        _ = le(e), se(_);
        let o = Te(a => {
            a !== e && (e = a, _ = le(e), se(_), t?.(_, e))
        });
        return {
            get locale() {
                return _
            },
            get preference() {
                return e
            },
            setPreference: async a => {
                e = a, _ = le(e), se(_), await we(e), t?.(_, e)
            },
            destroy: o
        }
    }

    function Me(t) {
        let e = ie(t);
        return e.length === 0 ? {
            valid: !1,
            error: n("validationCollectionNameEmpty")
        } : e.length > 60 ? {
            valid: !1,
            error: n("validationCollectionNameTooLong", {
                max: 60
            })
        } : {
            valid: !0,
            value: e
        }
    }

    function Ie(t) {
        let e = t.trim();
        return z(e) ? {
            valid: !0,
            value: e
        } : {
            valid: !1,
            error: n("validationUrlInvalid")
        }
    }

    function Pe(t) {
        let e = ie(t) || n("untitledItem");
        return e.length > 300 ? {
            valid: !1,
            error: n("validationTitleTooLong", {
                max: 300
            })
        } : {
            valid: !0,
            value: e
        }
    }
    var N = class extends Error {};

    function Fe(t, e) {
        let o = t.collections.find(i => i.id === e);
        if (!o) throw new N(n("serviceCollectionNotFound"));
        return o
    }
    async function Oe() {
        return [...(await M()).collections]
    }
    async function He(t, e = Ae) {
        let o = Me(t);
        if (!o.valid || !o.value) throw new N(o.error ?? n("genericInvalidValue"));
        let i = await M();
        if (i.collections.length >= 200) throw new N(n("serviceMaxCollectionsReached", {
            max: 200
        }));
        if (globalThis.KeepitDedup && globalThis.KeepitDedup.findDuplicateCollection(i.collections, o.value)) throw new N(n("serviceDuplicateCollectionName"));
        let a = Date.now(),
            s = {
                id: ae(),
                name: o.value,
                color: e,
                pinned: !1,
                createdAt: a,
                updatedAt: a,
                items: []
            };
        return i.collections.push(s), i.lastUsedCollectionId = s.id, await H(i), s
    }
    // Rename a collection (validates + rejects duplicate names, same rules as creation).
    async function renameCollection(t, e) {
        let o = Me(e);
        if (!o.valid || !o.value) throw new N(o.error ?? n("genericInvalidValue"));
        let i = await M(),
            a = Fe(i, t);
        if (globalThis.KeepitDedup && globalThis.KeepitDedup.findDuplicateCollection(i.collections, o.value, t)) throw new N(n("serviceDuplicateCollectionName"));
        return a.name = o.value, a.updatedAt = Date.now(), await H(i), a
    }
    async function setCollectionColor(t, e) {
        let o = await M(),
            i = Fe(o, t);
        return i.color = e, i.updatedAt = Date.now(), await H(o), i
    }
    // ينسخ مجموعة كاملة بعناصرها (مطابق لنفس الدالة في options/main.js).
    // كل عنصر يأخذ معرّفًا جديدًا حتى لا يظهر نفس المعرّف في مجموعتين معًا
    // — افتراض تعتمد عليه آلية سلة المحذوفات (diff.js) للتفريق بين النقل
    // والحذف الفعلي بمطابقة المعرّفات عبر كل المجموعات.
    async function duplicateCollection(t) {
        let e = await M(),
            o = Fe(e, t);
        if (e.collections.length >= 200) throw new N(n("serviceMaxCollectionsReached", {
            max: 200
        }));
        let i = n("duplicateCollectionNameTemplate", {
                name: o.name
            }),
            l = i,
            m = 2;
        for (; globalThis.KeepitDedup && globalThis.KeepitDedup.findDuplicateCollection(e.collections, l);) l = `${i} (${m})`, m++;
        let now = Date.now(),
            clone = {
                id: ae(),
                name: l,
                color: o.color,
                pinned: !1,
                createdAt: now,
                updatedAt: now,
                items: o.items.map(g => ({
                    ...g,
                    id: ae()
                }))
            };
        return e.collections.push(clone), e.lastUsedCollectionId = clone.id, await H(e), clone
    }
    async function Ue(t) {
        let e = await M();
        e.collections = e.collections.filter(o => o.id !== t), e.lastUsedCollectionId === t && (e.lastUsedCollectionId = null), await H(e)
    }
    async function qe(t, e) {
        let o = Ie(e.url);
        if (!o.valid || !o.value) throw new N(o.error ?? n("genericInvalidValue"));
        let i = Pe(e.title);
        if (!i.valid || !i.value) throw new N(i.error ?? n("genericInvalidValue"));
        let a = await M(),
            s = Fe(a, t);
        if (s.items.length >= 1e3) throw new N(n("serviceMaxItemsReached", {
            max: 1e3
        }));
        if (globalThis.KeepitDedup) {
            let dup = globalThis.KeepitDedup.findDuplicateItem(s.items, o.value, i.value);
            if (dup.url) throw new N(n("serviceDuplicateUrl"));
            if (dup.title) throw new N(n("serviceDuplicateItemTitle"));
        } else if (s.items.some(f => f.url === o.value)) throw new N(n("serviceDuplicateUrl"));
        let h = {
            id: ae(),
            url: o.value,
            title: i.value,
            faviconUrl: e.faviconUrl,
            note: e.note,
            createdAt: Date.now(),
            order: s.items.length
        };
        return s.items.push(h), s.updatedAt = Date.now(), a.lastUsedCollectionId = t, await H(a), h
    }
    async function Ke(t, e) {
        let o = await M(),
            i = Fe(o, t);
        i.items = i.items.filter(a => a.id !== e).map((a, s) => ({
            ...a,
            order: s
        })), i.updatedAt = Date.now(), await H(o)
    }
    // Moves one item from one collection to another (mirrors Ke() above,
    // plus appending into the target's items).
    async function moveItemToCollection(t, e, o) {
        let r = await M(),
            i = Fe(r, t),
            l = Fe(r, o),
            m = i.items.find(g => g.id === e);
        if (!m) throw new N(n("serviceItemNotFound"));
        i.items = i.items.filter(g => g.id !== e).map((g, d) => ({
            ...g,
            order: d
        })), l.items = [...l.items, {
            ...m,
            order: l.items.length
        }];
        let now = Date.now();
        return i.updatedAt = now, l.updatedAt = now, await H(r), l
    }
    var ze = te(q(), 1);
    async function Ve() {
        let [t] = await ze.default.tabs.query({
            active: !0,
            currentWindow: !0
        });
        return !t || !t.url ? null : {
            url: t.url,
            title: t.title || t.url,
            faviconUrl: t.favIconUrl
        }
    }
    var kt = "data-theme",
        Be = "(prefers-color-scheme: dark)";

    function je() {
        return window.matchMedia(Be).matches ? "dark" : "light"
    }

    function ce(t) {
        return t === "system" ? je() : t
    }

    function B(t) {
        document.documentElement.setAttribute(kt, t)
    }
    async function $e(t) {
        let e = await ke(),
            o = ce(e);
        B(o);
        let i = window.matchMedia(Be),
            a = () => {
                e === "system" && (o = je(), B(o), t?.(o, e))
            };
        i.addEventListener("change", a);
        let s = Le(f => {
            f !== e && (e = f, o = ce(e), B(o), t?.(o, e))
        });
        return {
            get preference() {
                return e
            },
            get resolved() {
                return o
            },
            setPreference: async f => {
                e = f, o = ce(e), B(o), await Se(e), t?.(o, e)
            },
            destroy: () => {
                i.removeEventListener("change", a), s()
            }
        }
    }

    function r(t, e = {}, o = []) {
        let i = document.createElement(t),
            {
                className: a,
                style: s,
                dataset: p,
                attrs: h,
                onClick: f,
                ...E
            } = e;
        if (a && (i.className = a), s && Object.assign(i.style, s), p)
            for (let [b, S] of Object.entries(p)) i.dataset[b] = S;
        if (h)
            for (let [b, S] of Object.entries(h)) i.setAttribute(b, S);
        f && i.addEventListener("click", b => f(b)), Object.assign(i, E);
        for (let b of o) b == null || b === !1 || i.append(typeof b == "string" ? document.createTextNode(b) : b);
        return i
    }

    function j(t) {
        for (; t.firstChild;) t.firstChild.remove()
    }
    var St = {
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
            copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
            folderOpen: '<path d="M3.5 8V6.2A1.7 1.7 0 0 1 5.2 4.5h4l1.8 2h7.3a1.7 1.7 0 0 1 1.7 1.7v.8M3.5 8h16.8a1 1 0 0 1 1 1.2l-1.6 8a1.7 1.7 0 0 1-1.7 1.3H5.3a1.7 1.7 0 0 1-1.7-1.4L2 9.3A1 1 0 0 1 3 8Z"/>',
            link: '<path d="M9.5 14.5 14.5 9.5M10.8 6.8l1.1-1.1a3.5 3.5 0 0 1 5 5l-1.1 1.1M13.2 17.2l-1.1 1.1a3.5 3.5 0 0 1-5-5l1.1-1.1"/>',
            alertTriangle: '<path d="M12 4.5 21 19.5H3L12 4.5Z"/><path d="M12 10v4.2M12 17.2h.01"/>',
            info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.7h.01"/>',
            sliders: '<path d="M5 6h6M15 6h4M5 12h10M19 12h0M5 18h2M11 18h8"/><circle cx="13" cy="6" r="1.6"/><circle cx="17" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/>',
            refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
            settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 12.9v-1.8l-2-.4a5.8 5.8 0 0 0-.6-1.4l1.1-1.7-1.3-1.3-1.7 1.1a5.8 5.8 0 0 0-1.4-.6l-.4-2h-1.8l-.4 2a5.8 5.8 0 0 0-1.4.6L8 6.3 6.7 7.6l1.1 1.7a5.8 5.8 0 0 0-.6 1.4l-2 .4v1.8l2 .4c.13.5.33.98.6 1.4l-1.1 1.7 1.3 1.3 1.7-1.1c.42.27.9.47 1.4.6l.4 2h1.8l.4-2c.5-.13.98-.33 1.4-.6l1.7 1.1 1.3-1.3-1.1-1.7c.27-.42.47-.9.6-1.4Z"/>',
            copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
            logo: '<path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v14.8l-6.5-3.9L5.5 19.8V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M9 11.2l2.2 2.2L15.2 9"/>'
        },
        Lt = new DOMParser;

    function v(t, e = "") {
        let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${St[t]}</svg>`,
            a = Lt.parseFromString(o, "image/svg+xml").documentElement;
        return e && a.setAttribute("class", e), a.setAttribute("aria-hidden", "true"), a.setAttribute("focusable", "false"), a
    }

    function $(t, e = "") {
        let i = document.documentElement.dir === "rtl" ? `icon-flip-rtl ${e}`.trim() : e;
        return v(t, i)
    }

    function de(t) {
        let e = [v(t.iconName, "empty-state__icon"), r("p", {
            className: "empty-state__title"
        }, [t.title]), r("p", {
            className: "empty-state__description"
        }, [t.description])];
        return t.actionLabel && t.onAction && e.push(r("button", {
            className: "btn btn--secondary btn--sm",
            type: "button",
            onClick: t.onAction
        }, [t.actionLabel])), r("div", {
            className: "empty-state"
        }, e)
    }

    function Ge(t) {
        let {
            collection: e
        } = t, i = [r("button", {
            type: "button",
            className: "collection-row__main",
            attrs: {
                "aria-current": t.selected ? "true" : "false"
            },
            onClick: () => t.onOpen()
        }, [r("span", {
            className: "color-dot",
            dataset: {
                color: e.color
            }
        }), r("span", {
            className: "collection-row__name",
            attrs: {
                title: e.name
            }
        }, [e.name]), r("span", {
            className: "count-badge"
        }, [String(e.items.length)]), r("span", {
            className: "collection-row__chevron"
        }, [$("chevronRight")])])];
        return t.actions && t.actions.length > 0 && i.push(r("span", {
            className: "collection-row__actions"
        }, t.actions.map(a => r("button", {
            type: "button",
            className: `btn btn--icon btn--sm${a.active?" is-active":""}`,
            attrs: {
                "aria-label": a.label,
                title: a.label
            },
            onClick: s => {
                s.stopPropagation(), a.onClick()
            }
        }, [v(a.iconName)])))), r("div", {
            className: `collection-row${t.selected?" collection-row--selected":""}`
        }, i)
    }
    var me = ["#5B8DEF", "#8B7CF6", "#4FB8D0", "#4CAF7D", "#E0A63E", "#E2685C", "#7C8DB5"];

    function _t(t) {
        let e = 0;
        for (let o = 0; o < t.length; o += 1) e = e * 31 + t.charCodeAt(o) >>> 0;
        return me[e % me.length] ?? me[0]
    }

    function We(t) {
        let e = R(t);
        return {
            letter: e.charAt(0).toUpperCase() || "?",
            backgroundColor: _t(e)
        }
    }

    function Xe(t) {
        return t ? t.startsWith("data:image/") ? !0 : z(t) : !1
    }

    function G(t, e) {
        if (Xe(e)) {
            let o = r("img", {
                className: "favicon",
                src: e,
                alt: "",
                loading: "lazy"
            });
            return o.addEventListener("error", () => {
                o.replaceWith(Ze(t))
            }, {
                once: !0
            }), o
        }
        return Ze(t)
    }

    function Ze(t) {
        let {
            letter: e,
            backgroundColor: o
        } = We(t);
        return r("span", {
            className: "favicon-fallback",
            style: {
                backgroundColor: o
            },
            attrs: {
                "aria-hidden": "true"
            }
        }, [e])
    }

    function Ye(t) {
        let {
            item: e
        } = t, o = [r("p", {
            className: "item-row__title"
        }, [e.title]), r("p", {
            className: "item-row__host"
        }, [R(e.url)])];
        e.note && o.push(r("p", {
            className: "item-row__note"
        }, [e.note]));
        let i = r("a", {
                className: "item-row__link",
                href: e.url,
                target: "_blank",
                rel: "noopener noreferrer",
                attrs: {
                    title: e.title
                }
            }, [G(e.url, e.faviconUrl), r("span", {
                className: "item-row__body"
            }, o)]),
            a = [];
        return t.onEditNote && a.push(r("button", {
            type: "button",
            className: "btn btn--icon",
            attrs: {
                "aria-label": n("editNoteAriaLabel", {
                    title: e.title
                })
            },
            onClick: () => t.onEditNote?.()
        }, [v("pencil")])), t.onMove && a.push(r("button", {
            type: "button",
            className: "btn btn--icon",
            attrs: {
                "aria-label": n("moveItemAriaLabel", {
                    title: e.title
                })
            },
            onClick: () => t.onMove?.()
        }, [v("folderOpen")])), a.push(r("button", {
            type: "button",
            className: "btn btn--icon",
            attrs: {
                "aria-label": n("deleteItemAriaLabel", {
                    title: e.title
                })
            },
            onClick: () => t.onDelete()
        }, [v("trash")])), r("div", {
            className: "item-row"
        }, [i, r("div", {
            className: "item-row__actions"
        }, a)])
    }
    var Nt = {
        indigo: "color.indigo",
        sky: "color.sky",
        violet: "color.violet",
        emerald: "color.emerald",
        amber: "color.amber",
        rose: "color.rose",
        slate: "color.slate"
    };

    function Qe(t) {
        let e = t.selected,
            o = re.map(i => {
                let a = n(Nt[i]),
                    s = r("button", {
                        type: "button",
                        className: "color-picker__swatch",
                        dataset: {
                            color: i
                        },
                        attrs: {
                            "aria-pressed": String(i === e),
                            "aria-label": a,
                            title: a
                        }
                    }, [i === e ? v("check") : ""]);
                return s.addEventListener("click", () => {
                    e = i, t.onSelect(i);
                    for (let p of o) {
                        let h = p.dataset.color;
                        p.setAttribute("aria-pressed", String(h === e)), j(p), h === e && p.append(v("check"))
                    }
                }), s
            });
        return r("div", {
            className: "color-picker",
            attrs: {
                role: "group",
                "aria-label": n("colorPickerAriaLabel")
            }
        }, o)
    }

    function Je(t) {
        let e = t.initialColor,
            o = r("input", {
                className: "input",
                type: "text",
                id: "collection-name-input",
                placeholder: n("collectionNamePlaceholder"),
                maxLength: 60,
                value: t.initialName ?? "",
                attrs: {
                    autocomplete: "off"
                }
            }),
            i = r("p", {
                className: "field__hint field__hint--error",
                attrs: {
                    role: "alert"
                }
            }, []);
        i.style.display = "none";
        let a = r("form", {
            className: "collection-form"
        }, [r("div", {
            className: "field"
        }, [r("label", {
            className: "field__label",
            htmlFor: "collection-name-input"
        }, [n("collectionNameLabel")]), o, i]), r("div", {
            className: "field"
        }, [r("span", {
            className: "field__label"
        }, [n("collectionColorLabel")]), Qe({
            selected: e,
            onSelect: s => {
                e = s
            }
        })]), r("div", {
            className: "dialog__actions"
        }, [r("button", {
            type: "button",
            className: "btn btn--secondary",
            onClick: () => t.onCancel()
        }, [n("cancel")]), r("button", {
            type: "submit",
            className: "btn btn--primary"
        }, [t.submitLabel])])]);
        return a.addEventListener("submit", s => {
            s.preventDefault();
            let p = o.value.trim();
            if (!p) {
                i.textContent = n("collectionNameRequired"), i.style.display = "block", o.focus();
                return
            }
            t.onSubmit({
                name: p,
                color: e
            })
        }), a
    }
    var et = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function W(t, e) {
        let o = document.activeElement,
            i = `dialog-title-${Math.random().toString(36).slice(2,8)}`,
            a = r("div", {
                className: `dialog${e.size?` dialog--${e.size}`:""}`,
                attrs: {
                    role: "dialog",
                    "aria-modal": "true",
                    "aria-labelledby": i
                }
            }, [r("div", {
                className: "dialog__header"
            }, [r("h2", {
                className: "dialog__title",
                id: i
            }, [e.title])]), e.body]),
            s = r("div", {
                className: "overlay"
            }, [a]);
        t.append(s);

        function p() {
            document.removeEventListener("keydown", h), s.remove(), e.onClose?.(), o?.focus?.()
        }

        function h(f) {
            if (f.key === "Escape") {
                f.preventDefault(), p();
                return
            }
            if (f.key !== "Tab") return;
            let E = Array.from(a.querySelectorAll(et));
            if (E.length === 0) return;
            let b = E[0],
                S = E[E.length - 1],
                I = document.activeElement;
            f.shiftKey && I === b ? (f.preventDefault(), S.focus()) : !f.shiftKey && I === S && (f.preventDefault(), b.focus())
        }
        return s.addEventListener("mousedown", f => {
            f.target === s && e.closeOnOverlayClick !== !1 && p()
        }), document.addEventListener("keydown", h), requestAnimationFrame(() => {
            a.querySelector(et)?.focus()
        }), {
            element: a,
            close: p
        }
    }

    function tt(t, e) {
        return new Promise(o => {
            let i = !1,
                a = h => {
                    i || (i = !0, o(h), p.close())
                },
                s = r("div", {
                    className: "confirm-dialog"
                }, [r("div", {
                    className: "confirm-dialog__icon"
                }, [v("alertTriangle")]), r("p", {
                    className: "confirm-dialog__message"
                }, [e.message]), r("div", {
                    className: "dialog__actions"
                }, [r("button", {
                    type: "button",
                    className: "btn btn--secondary",
                    onClick: () => a(!1)
                }, [e.cancelLabel ?? n("cancel")]), r("button", {
                    type: "button",
                    className: e.danger ? "btn btn--danger" : "btn btn--primary",
                    onClick: () => a(!0)
                }, [e.confirmLabel ?? n("confirm")])])]),
                p = W(t, {
                    title: e.title,
                    body: s,
                    onClose: () => a(!1)
                })
        })
    }
    var Et = 3200,
        X = class {
            stack;
            constructor(e) {
                this.stack = r("div", {
                    className: "toast-stack",
                    attrs: {
                        role: "status",
                        "aria-live": "polite"
                    }
                }), e.append(this.stack)
            }
            show(e, o = "info") {
                let i = o === "success" ? "check" : o === "error" ? "alertTriangle" : "info",
                    a = r("div", {
                        className: `toast toast--${o}`
                    }, [v(i), r("span", {}, [e])]);
                this.stack.append(a);
                let s = () => a.remove(),
                    p = setTimeout(s, Et);
                a.addEventListener("click", () => {
                    clearTimeout(p), s()
                })
            }
            destroy() {
                this.stack.remove()
            }
        };

    function ot(t) {
        let e = t.resolvedTheme === "dark",
            o = t.locale === "ar" ? "EN" : "\u0639";
        let refreshBtn = r("button", {
            type: "button",
            className: "btn btn--icon btn--refresh",
            attrs: {
                "aria-label": n("refreshAriaLabel"),
                title: n("refreshAriaLabel")
            }
        }, [v("refresh")]);
        refreshBtn.addEventListener("click", async () => {
            if (refreshBtn.classList.contains("is-loading")) return;
            refreshBtn.classList.add("is-loading");
            try {
                await t.onRefresh();
            } finally {
                refreshBtn.classList.remove("is-loading");
            }
        });
        return r("header", {
            className: "popup__header"
        }, [r("div", {
            className: "popup__brand"
        }, [r("span", {
            className: "popup__logo"
        }, [v("logo")]), r("span", {
            className: "popup__title"
        }, [n("appName")])]), r("div", {
            className: "popup__header-actions"
        }, [r("button", {
            type: "button",
            className: "btn btn--icon btn--lang",
            attrs: {
                "aria-label": n("languageSwitchAriaLabel"),
                title: n("languageSwitchAriaLabel")
            },
            onClick: () => t.onToggleLocale()
        }, [o]), r("button", {
            type: "button",
            className: "btn btn--icon",
            attrs: {
                "aria-label": e ? n("themeSwitchToLight") : n("themeSwitchToDark"),
                title: e ? n("themeSwitchToLight") : n("themeSwitchToDark")
            },
            onClick: () => t.onToggleTheme()
        }, [v(e ? "sun" : "moon")]), refreshBtn, r("button", {
            type: "button",
            className: "btn btn--icon",
            attrs: {
                "aria-label": n("openFullManager")
            },
            onClick: () => t.onOpenManager()
        }, [v("sliders")])])])
    }

    function ge(t) {
        let {
            activeTab: e
        } = t;
        if (!e) return r("div", {
            className: "quick-add"
        }, [r("p", {
            className: "quick-add__tab-host"
        }, [n("quickAddTabUnavailable")])]);
        let o = r("select", {
            className: "input quick-add__select",
            attrs: {
                "aria-label": n("quickAddSelectCollection")
            }
        }, t.collections.map(a => r("option", {
            value: a.id,
            selected: a.id === t.selectedCollectionId
        }, [a.name])));
        o.addEventListener("change", () => t.onSelectCollection(o.value)), t.selectedCollectionId && (o.value = t.selectedCollectionId);
        let i = t.isAlreadySaved ? r("button", {
            type: "button",
            className: "btn btn--secondary",
            disabled: !0
        }, [v("check"), n("quickAddSaved")]) : r("button", {
            type: "button",
            className: "btn btn--primary",
            disabled: t.collections.length === 0,
            onClick: () => t.onAdd()
        }, [v("plus"), n("quickAddAdd")]);
        return r("div", {
            className: "quick-add"
        }, [r("div", {
            className: "quick-add__tab"
        }, [G(e.url, e.faviconUrl), r("div", {
            className: "quick-add__tab-body"
        }, [r("p", {
            className: "quick-add__tab-title"
        }, [e.title]), r("p", {
            className: "quick-add__tab-host"
        }, [R(e.url)])])]), r("div", {
            className: "quick-add__row"
        }, [o, i]), t.alsoSavedIn ? r("p", {
            className: "quick-add__shortcut-hint"
        }, [n("quickAddAlsoSavedIn", {
            name: t.alsoSavedIn.name
        })]) : !1, t.shortcutHint && !t.isAlreadySaved ? r("p", {
            className: "quick-add__shortcut-hint"
        }, [n("quickAddShortcutHint", {
            shortcut: t.shortcutHint
        })]) : !1])
    }
    var at = document.getElementById("app");
    if (!at) throw new Error("\u0639\u0646\u0635\u0631 \u0627\u0644\u062C\u0630\u0631 #app \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A popup.html");
    var pe = r("div"),
        ue = r("div", {
            className: "popup__content"
        });
    at.append(r("div", {
        className: "popup"
    }, [pe, ue]));
    var F = new X(document.body),
        m = {
            collections: [],
            screen: {
                name: "list"
            },
            activeTab: null,
            quickAddCollectionId: null,
            shortcutHint: null,
            searchQuery: ""
        },
        Z, Y;

    function it(t) {
        return m.collections.find(e => e.id === t)
    }

    function U() {
        let t = ot({
            resolvedTheme: Z.resolved,
            locale: Y.locale,
            onToggleTheme: () => {
                Z.setPreference(Z.resolved === "dark" ? "light" : "dark").then(U)
            },
            onToggleLocale: () => {
                Y.setPreference(Y.locale === "ar" ? "en" : "ar")
            },
            onOpenManager: () => {
                Mt()
            },
            onRefresh: async () => {
                let result;
                try {
                    result = typeof window.KeepitLocalSyncRefresh === "function" ? await window.KeepitLocalSyncRefresh() : {
                        ok: !0,
                        changed: !1
                    }
                } catch {
                    result = {
                        ok: !1
                    }
                }
                result && result.ok !== !1 ? F.show(n(result.changed ? "refreshToastChanged" : "refreshToastUpToDate"), result.changed ? "success" : "info") : F.show(n("refreshToastError"), "error")
            }
        });
        pe.replaceWith(t), pe = t
    }
    async function Mt() {
        await fe.default.runtime.openOptionsPage(), window.close()
    }

    // --- List screen: quick-add + search + collections ---------------------
    // The search <input> is built once (buildListScreen) and stays mounted
    // for as long as the list screen is showing. Re-renders triggered by
    // typing, or by a storage change event while the list screen is active,
    // only refresh the quick-add block and the results area below the
    // input (renderQuickAddSection / renderListResults) - the input node
    // itself is never re-created, so it never loses focus or caret
    // position while the user is typing a query.
    var listQuickAddEl = null,
        listSearchInputEl = null,
        listResultsEl = null,
        mountedScreenName = null;

    function D() {
        if (m.screen.name === "list") {
            mountedScreenName === "list" && listResultsEl ? (renderQuickAddSection(), renderListResults()) : (j(ue), ue.append(buildListScreen()), mountedScreenName = "list");
            return
        }
        j(ue), ue.append(It(m.screen.collectionId)), mountedScreenName = "detail"
    }

    function buildListScreen() {
        let t = r("div", {
            className: "screen screen--list"
        }, []);
        listQuickAddEl = r("div", {}, []), t.append(listQuickAddEl);
        let e = r("input", {
            type: "search",
            className: "input",
            placeholder: n("searchPlaceholder"),
            value: m.searchQuery,
            attrs: {
                "aria-label": n("searchAriaLabel")
            }
        });
        return e.addEventListener("input", () => {
            m.searchQuery = e.value, renderListResults()
        }), listSearchInputEl = e, t.append(r("div", {
            className: "popup__search"
        }, [v("search"), e])), listResultsEl = r("div", {}, []), t.append(listResultsEl), renderQuickAddSection(), renderListResults(), t
    }

    // يحدّث placeholder و aria-label لحقل البحث المُركَّب مسبقًا دون إعادة
    // إنشائه، حفاظًا على تركيز/موضع المؤشر عند تبديل اللغة أثناء الكتابة.
    function refreshListSearchTexts() {
        listSearchInputEl && (
            listSearchInputEl.placeholder = n("searchPlaceholder"),
            listSearchInputEl.setAttribute("aria-label", n("searchAriaLabel"))
        );
    }

    function renderQuickAddSection() {
        listQuickAddEl && (j(listQuickAddEl), listQuickAddEl.append(ge({
            activeTab: m.activeTab,
            collections: m.collections,
            selectedCollectionId: m.quickAddCollectionId,
            isAlreadySaved: lt(m.quickAddCollectionId, m.activeTab?.url),
            alsoSavedIn: m.activeTab?.url && globalThis.KeepitDedup ? globalThis.KeepitDedup.findItemAcrossCollections(m.collections, m.activeTab.url, m.quickAddCollectionId)?.collection ?? null : null,
            shortcutHint: m.shortcutHint ?? void 0,
            onSelectCollection: e => {
                m.quickAddCollectionId = e
            },
            onAdd: () => void st()
        })))
    }

    function searchAllSavedItems(t) {
        let e = t.trim().toLowerCase();
        if (!e) return [];
        let o = [];
        for (let a of m.collections)
            for (let s of a.items)`${s.title} ${R(s.url)} ${s.note??""}`.toLowerCase().includes(e) && o.push({
                item: s,
                collection: a
            });
        return o.sort((a, s) => s.item.createdAt - a.item.createdAt)
    }

    function buildSearchResultsView(t, e) {
        return e.length === 0 ? de({
            iconName: "search",
            title: n("searchResultsEmptyTitle"),
            description: n("searchResultsEmptyDescription", {
                query: t
            })
        }) : r("div", {}, [r("div", {
            className: "section-heading"
        }, [r("span", {
            className: "section-heading__title"
        }, [n("searchResultsTitle")]), r("span", {
            className: "count-badge"
        }, [String(e.length)])]), r("div", {
            className: "item-list"
        }, e.map(({
            item: o,
            collection: a
        }) => r("div", {
            className: "search-result"
        }, [r("span", {
            className: "popup__search-results-tag"
        }, [n("searchResultsInCollection", {
            collection: a.name
        })]), Ye({
            item: o,
            onDelete: () => void Rt(a.id, o.id),
            onMove: () => openMoveItemDialog(a.id, o.id)
        })])))])
    }

    function renderListResults() {
        if (!listResultsEl) return;
        j(listResultsEl);
        let t = m.searchQuery.trim();
        if (t) {
            listResultsEl.append(buildSearchResultsView(t, searchAllSavedItems(t)));
            return
        }
        listResultsEl.append(r("div", {
            className: "section-heading"
        }, [r("span", {
            className: "section-heading__title"
        }, [n("collectionsSectionTitle")]), r("button", {
            type: "button",
            className: "btn btn--icon",
            attrs: {
                "aria-label": n("createCollectionAriaLabel")
            },
            onClick: () => rt()
        }, [v("plus")])])), m.collections.length === 0 ? listResultsEl.append(de({
            iconName: "folderOpen",
            title: n("emptyCollectionsTitle"),
            description: n("emptyCollectionsDescription"),
            actionLabel: n("emptyCollectionsAction"),
            onAction: () => rt()
        })) : listResultsEl.append(r("div", {
            className: "collection-list"
        }, m.collections.map(e => Ge({
            collection: e,
            onOpen: () => {
                m.searchQuery = "", m.screen = {
                    name: "detail",
                    collectionId: e.id
                }, D()
            },
            actions: [{
                iconName: "pencil",
                label: n("editCollectionAction"),
                onClick: () => openEditCollectionDialog(e)
            }, {
                iconName: "copy",
                label: n("duplicateCollectionAction"),
                onClick: () => duplicateCollectionHandler(e)
            }]
        }))))
    }
    // Duplicates a collection and shows a success/error toast (mirrors
    // openEditCollectionDialog's onSubmit try/catch pattern above).
    async function duplicateCollectionHandler(t) {
        try {
            let clone = await duplicateCollection(t.id);
            F.show(n("toastCollectionDuplicated", {
                name: clone.name
            }), "success")
        } catch (e) {
            F.show(e instanceof Error ? e.message : n("toastCollectionDuplicateFailed"), "error")
        }
    }
    // Opens the rename/recolor dialog for a collection (mirrors the create-collection dialog in rt()).
    function openEditCollectionDialog(t) {
        let e = Je({
                initialName: t.name,
                initialColor: t.color,
                submitLabel: n("saveChangesAction"),
                onSubmit: ({
                    name: i,
                    color: a
                }) => {
                    (async () => {
                        try {
                            await renameCollection(t.id, i), await setCollectionColor(t.id, a), o.close(), F.show(n("toastCollectionSaved"), "success")
                        } catch (s) {
                            F.show(s instanceof Error ? s.message : n("toastCollectionSaveFailed"), "error")
                        }
                    })()
                },
                onCancel: () => o.close()
            }),
            o = W(document.body, {
                title: n("editCollectionTitle"),
                body: e
            })
    }

    function It(t) {
        let e = it(t);
        if (!e) return m.screen = {
            name: "list"
        }, mountedScreenName = "list", buildListScreen();
        let o = r("div", {
                className: "detail-header"
            }, [r("button", {
                type: "button",
                className: "btn btn--icon",
                attrs: {
                    "aria-label": n("backToCollections")
                },
                onClick: () => {
                    m.screen = {
                        name: "list"
                    }, D()
                }
            }, [$("arrowLeft")]), r("h1", {
                className: "detail-header__title"
            }, [r("span", {
                className: "color-dot",
                dataset: {
                    color: e.color
                }
            }), r("span", {}, [e.name])]), r("span", {
                className: "count-badge"
            }, [String(e.items.length)]), r("button", {
                type: "button",
                className: "btn btn--icon",
                attrs: {
                    "aria-label": n("deleteCollectionAriaLabel", {
                        name: e.name
                    })
                },
                onClick: () => void Pt(e)
            }, [v("trash")])]),
            i = ge({
                activeTab: m.activeTab,
                collections: [e],
                selectedCollectionId: e.id,
                isAlreadySaved: lt(e.id, m.activeTab?.url),
                shortcutHint: m.shortcutHint ?? void 0,
                onSelectCollection: () => {},
                onAdd: () => void st(e.id)
            }),
            a = e.items.length === 0 ? de({
                iconName: "link",
                title: n("emptyItemsTitle"),
                description: n("emptyItemsDescription")
            }) : r("div", {
                className: "item-list"
            }, [...e.items].sort((s, p) => s.order - p.order).map(s => Ye({
                item: s,
                onDelete: () => void Rt(e.id, s.id),
                onMove: () => openMoveItemDialog(e.id, s.id)
            })));
        return r("div", {
            className: "screen screen--detail"
        }, [o, i, a])
    }

    function lt(t, e) {
        if (!t || !e) return !1;
        let o = it(t);
        return o ? o.items.some(i => i.url === e) : !1
    }
    async function st(t) {
        let e = t ?? m.quickAddCollectionId;
        if (!(!e || !m.activeTab)) try {
            await qe(e, {
                url: m.activeTab.url,
                title: m.activeTab.title,
                faviconUrl: m.activeTab.faviconUrl
            }), F.show(n("toastItemAdded"), "success")
        } catch (o) {
            F.show(o instanceof Error ? o.message : n("toastItemAddFailed"), "error")
        }
    }

    function rt() {
        let t = Je({
                initialColor: "indigo",
                submitLabel: n("createAction"),
                onSubmit: ({
                    name: o,
                    color: i
                }) => {
                    (async () => {
                        try {
                            let a = await He(o, i);
                            m.quickAddCollectionId = a.id, e.close(), F.show(n("toastCollectionCreated"), "success")
                        } catch (a) {
                            F.show(a instanceof Error ? a.message : n("toastCollectionCreateFailed"), "error")
                        }
                    })()
                },
                onCancel: () => e.close()
            }),
            e = W(document.body, {
                title: n("newCollectionTitle"),
                body: t
            })
    }
    async function Pt(t) {
        await tt(document.body, {
            title: n("deleteCollectionDialogTitle"),
            message: n("deleteCollectionDialogMessage", {
                name: t.name,
                count: t.items.length
            }),
            confirmLabel: n("deleteCollectionConfirmLabel"),
            danger: !0
        }) && (await Ue(t.id), m.screen = {
            name: "list"
        }, F.show(n("toastCollectionDeleted"), "success"))
    }
    async function Rt(t, e) {
        await Ke(t, e), F.show(n("toastItemDeleted"), "success")
    }
    // Opens a small "move to..." dialog for one saved item (mirrors the
    // create/edit-collection dialogs above: a small form inside W()).
    function openMoveItemDialog(t, e) {
        let targets = m.collections.filter(g => g.id !== t);
        if (targets.length === 0) {
            F.show(n("moveItemNoOtherCollections"), "error");
            return
        }
        let sourceItem = m.collections.find(g => g.id === t)?.items.find(g => g.id === e),
            select = r("select", {
                className: "input",
                id: "move-item-target-select"
            }, targets.map(g => {
                let dup = sourceItem && globalThis.KeepitDedup && globalThis.KeepitDedup.findDuplicateItem(g.items, sourceItem.url, sourceItem.title).url;
                return r("option", {
                    attrs: {
                        value: g.id
                    }
                }, [dup ? `${g.name} — ${n("moveItemDuplicateHint")}` : g.name])
            })),
            form = r("form", {
                className: "collection-form"
            }, [r("div", {
                className: "field"
            }, [r("label", {
                className: "field__label",
                htmlFor: "move-item-target-select"
            }, [n("moveItemTargetLabel")]), select]), r("div", {
                className: "dialog__actions"
            }, [r("button", {
                type: "button",
                className: "btn btn--secondary",
                onClick: () => dialog.close()
            }, [n("cancel")]), r("button", {
                type: "submit",
                className: "btn btn--primary"
            }, [n("moveItemConfirmAction")])])]);
        form.addEventListener("submit", i => {
            i.preventDefault();
            (async () => {
                try {
                    let target = await moveItemToCollection(t, e, select.value);
                    dialog.close(), F.show(n("toastItemMoved", {
                        name: target.name
                    }), "success")
                } catch (l) {
                    F.show(l instanceof Error ? l.message : n("toastItemMoveFailed"), "error")
                }
            })()
        });
        var dialog = W(document.body, {
            title: n("moveItemDialogTitle"),
            body: form
        })
    }
    async function Dt() {
        Z = await $e(() => U()), Y = await Ne(() => {
            U(), D(), refreshListSearchTexts()
        }), U();
        let [t, e, o, i] = await Promise.all([Oe(), M(), Ve(), Ft()]);
        m.collections = t, m.activeTab = o, m.shortcutHint = i;
        let a = t.some(s => s.id === e.lastUsedCollectionId);
        m.quickAddCollectionId = a ? e.lastUsedCollectionId : t[0]?.id ?? null, D(), ye(s => {
            m.collections = [...s.collections], m.collections.some(p => p.id === m.quickAddCollectionId) || (m.quickAddCollectionId = m.collections[0]?.id ?? null), D()
        })
    }
    async function Ft() {
        try {
            let e = (await fe.default.commands.getAll()).find(o => o.name === "save-current-tab");
            return e?.shortcut && e.shortcut.length > 0 ? e.shortcut : null
        } catch {
            return null
        }
    }
    Dt();
})();