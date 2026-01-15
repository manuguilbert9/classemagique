/* source : https://www.npmjs.com/package/@blockly/field-slider */
!(function (e, n) {
  if ("object" == typeof exports && "object" == typeof module)
    module.exports = n(require("blockly/core"));
  else if ("function" == typeof define && define.amd)
    define(["blockly/core"], n);
  else {
    var t =
      "object" == typeof exports ? n(require("blockly/core")) : n(e.Blockly);
    for (var r in t) ("object" == typeof exports ? exports : e)[r] = t[r];
  }
})(this, (e) =>
  (() => {
    "use strict";
    var n = {
        370: (n) => {
          n.exports = e;
        },
      },
      t = {};
    function r(e) {
      var i = t[e];
      if (void 0 !== i) return i.exports;
      var o = (t[e] = { exports: {} });
      return n[e](o, o.exports, r), o.exports;
    }
    (r.d = (e, n) => {
      for (var t in n)
        r.o(n, t) &&
          !r.o(e, t) &&
          Object.defineProperty(e, t, { enumerable: !0, get: n[t] });
    }),
      (r.o = (e, n) => Object.prototype.hasOwnProperty.call(e, n)),
      (r.r = (e) => {
        "undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(e, "__esModule", { value: !0 });
      });
    var i = {};
    return (
      (() => {
        r.r(i), r.d(i, { FieldSlider: () => n });
        var e = r(370);
        class n extends e.FieldNumber {
          constructor(e, n, t, r, i, o) {
            super(e, n, t, r, i, o),
              (this.boundEvents = []),
              (this.sliderInput = null);
          }
          static fromJson(e) {
            return new this(e.value, void 0, void 0, void 0, void 0, e);
          }
          showEditor_(n, t) {
            super.showEditor_(n, !0);
            const r = this.dropdownCreate_();
            e.DropDownDiv.getContentDiv().appendChild(r);
            const i = this.getSourceBlock();
            if (i instanceof e.BlockSvg) {
              const n = i.getColour() || "",
                t = i.getColourTertiary() || "";
              e.DropDownDiv.setColour(n, t);
            }
            e.DropDownDiv.showPositionedByField(
              this,
              this.dropdownDispose_.bind(this)
            ),
              t || r.firstChild.focus({ preventScroll: !0 });
          }
          render_() {
            super.render_(), this.updateSlider_();
          }
          dropdownCreate_() {
            const n = document.createElement("div");
            n.className = "fieldSliderContainer";
            const t = document.createElement("input");
            return (
              t.setAttribute("type", "range"),
              t.setAttribute("min", `${this.min_}`),
              t.setAttribute("max", `${this.max_}`),
              t.setAttribute("step", `${this.precision_}`),
              t.setAttribute("value", `${this.getValue()}`),
              t.setAttribute("tabindex", "0"),
              (t.className = "fieldSlider"),
              n.appendChild(t),
              (this.sliderInput = t),
              this.boundEvents.push(
                e.browserEvents.conditionalBind(
                  t,
                  "input",
                  this,
                  this.onSliderChange_
                )
              ),
              n
            );
          }
          dropdownDispose_() {
            for (const n of this.boundEvents) e.browserEvents.unbind(n);
            (this.boundEvents.length = 0), (this.sliderInput = null);
          }
          onSliderChange_() {
            var n;
            const t = this.value_;
            this.setEditorValue_(
              null === (n = this.sliderInput) || void 0 === n
                ? void 0
                : n.value,
              !1
            ),
              this.getSourceBlock() &&
                e.Events.fire(
                  new (e.Events.get(e.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE))(
                    this.sourceBlock_,
                    this.name || null,
                    t,
                    this.value_
                  )
                ),
              this.resizeEditor_();
          }
          updateSlider_() {
            this.sliderInput &&
              this.sliderInput.setAttribute("value", `${this.getValue()}`);
          }
        }
        e.fieldRegistry.register("field_slider", n),
          e.Css.register(
            "\n.fieldSliderContainer {\n  align-items: center;\n  display: flex;\n  height: 32px;\n  justify-content: center;\n  width: 150px;\n}\n.fieldSlider {\n  -webkit-appearance: none;\n  background: transparent; /* override white in chrome */\n  margin: 4px;\n  padding: 0;\n  width: 100%;\n}\n.fieldSlider:focus {\n  outline: none;\n}\n/* Webkit */\n.fieldSlider::-webkit-slider-runnable-track {\n  background: #ddd;\n  border-radius: 5px;\n  height: 10px;\n}\n.fieldSlider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  background: #fff;\n  border-radius: 50%;\n  box-shadow: 0 0 0 4px rgba(255,255,255,.15);\n  cursor: pointer;\n  height: 24px;\n  margin-top: -7px;\n  width: 24px;\n}\n/* Firefox */\n.fieldSlider::-moz-range-track {\n  background: #ddd;\n  border-radius: 5px;\n  height: 10px;\n}\n.fieldSlider::-moz-range-thumb {\n  background: #fff;\n  border: none;\n  border-radius: 50%;\n  box-shadow: 0 0 0 4px rgba(255,255,255,.15);\n  cursor: pointer;\n  height: 24px;\n  width: 24px;\n}\n.fieldSlider::-moz-focus-outer {\n  /* override the focus border style */\n  border: 0;\n}\n/* IE */\n.fieldSlider::-ms-track {\n  /* IE wont let the thumb overflow the track, so fake it */\n  background: transparent;\n  border-color: transparent;\n  border-width: 15px 0;\n  /* remove default tick marks */\n  color: transparent;\n  height: 10px;\n  width: 100%;\n  margin: -4px 0;\n}\n.fieldSlider::-ms-fill-lower  {\n  background: #ddd;\n  border-radius: 5px;\n}\n.fieldSlider::-ms-fill-upper  {\n  background: #ddd;\n  border-radius: 5px;\n}\n.fieldSlider::-ms-thumb {\n  background: #fff;\n  border: none;\n  border-radius: 50%;\n  box-shadow: 0 0 0 4px rgba(255,255,255,.15);\n  cursor: pointer;\n  height: 24px;\n  width: 24px;\n}\n"
          );
      })(),
      i
    );
  })()
);
