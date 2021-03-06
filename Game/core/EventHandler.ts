module Ezelia {
    export class EventHandler {
        // make module able to trigger custom events
        // ========================================================================================
        private _events: any;

        bind(event, fct) {
            this._events = this._events || {};
            this._events[event] = this._events[event] || [];
            this._events[event].push(fct);
        }
        //same as bind
        on(event, fct) {
            this._events = this._events || {};
            this._events[event] = this._events[event] || [];
            this._events[event].push(fct);
        }

        unbind(event, fct) {
            this._events = this._events || {};
            if (event in this._events === false) return;
            this._events[event].splice(this._events[event].indexOf(fct), 1);
        }
        unbindEvent(event) {
            this._events = this._events || {};
            this._events[event] = [];
        }
        unbindAll() {
            this._events = this._events || {};
            for (var event in this._events) this._events[event] = false;
        }
        trigger(event, ...args: any[]) {
            this._events = this._events || {};
            if (event in this._events !== false) {
                for (var i = 0; i < this._events[event].length; i++) {
                    this._events[event][i].apply(this, args);
                }
            }
        }

        registerEvent(evtname) {
            if (typeof this[evtname] == 'function') return this[evtname];
            this[evtname] = function (callback, replace) {

                if (typeof callback == 'function') {
                    if (replace) this.unbindEvent(evtname);

                    this.bind(evtname, callback);
                }

                return this;
            };
        }
        // ====================================================================================
    }
}