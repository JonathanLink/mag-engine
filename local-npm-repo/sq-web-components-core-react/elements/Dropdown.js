var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Manager, Popper, Target } from "react-popper";
import Portal from "react-travel";
import clickOutside from "../utils/clickOutside";
import NamespaceWrapper from "../utils/NamespaceWrapper";
import { isIE9OrBelow, isRTL } from "../utils";
var Dropdown = /** @class */ (function (_super) {
    __extends(Dropdown, _super);
    function Dropdown(props) {
        var _this = _super.call(this, props) || this;
        _this.setOusideTap = function () {
            var elements = [_this.target];
            if (_this.popper) {
                elements.push(_this.popper);
            }
            if (_this.outsideTap) {
                _this.outsideTap.remove();
            }
            _this.outsideTap = clickOutside(elements, ["click", "touchstart"], _this.handleOutsideTap);
        };
        _this.handleOutsideTap = function () {
            _this.setState({ open: false });
        };
        _this.handleClick = function (event) {
            if (_this.props.open && _this.state.open) {
                return;
            }
            _this.setState(function (oldState) { return ({
                open: !oldState.open
            }); });
            event.preventDefault();
        };
        _this.state = {
            open: !!props.open || false
        };
        return _this;
    }
    Dropdown.prototype.componentDidMount = function () {
        this.setOusideTap();
    };
    Dropdown.prototype.componentDidUpdate = function (lastProps, lastState) {
        var _this = this;
        if (lastState.open !== this.state.open) {
            setTimeout(function () { return _this.setOusideTap(); });
        }
    };
    Dropdown.prototype.componentWillReceiveProps = function (nextProps) {
        if (this.props.open != nextProps.open) {
            this.setState(function () { return ({ open: !!nextProps.open }); });
        }
    };
    Dropdown.prototype.componentWillUnmount = function () {
        this.outsideTap.remove();
    };
    Dropdown.prototype.renderTrigger = function () {
        if (typeof this.props.trigger === "function") {
            return this.props.trigger(this.state.open, React.createElement("span", { className: this.classes("Caret") }));
        }
        return this.props.trigger;
    };
    Dropdown.prototype.getPlacement = function (up) {
        if (this.manager && isRTL(this.manager)) {
            return up ? "top-end" : "bottom-end";
        }
        else {
            return up ? "top-start" : "bottom-start";
        }
    };
    Dropdown.prototype.render = function () {
        var _this = this;
        var _a = this.props, namespace = _a.namespace, disabled = _a.disabled, open = _a.open, size = _a.size, up = _a.up, trigger = _a.trigger, children = _a.children, className = _a.className, block = _a.block, props = __rest(_a, ["namespace", "disabled", "open", "size", "up", "trigger", "children", "className", "block"]);
        var classes = this.classes("Dropdown", disabled && "is-disabled", this.state.open && "is-open", size && "Dropdown--" + size, up && "Dropdown--dropup", block && "Dropdown--block", isIE9OrBelow() && "Dropdown--legacy", className);
        var ManagerComponent = isIE9OrBelow() ? "div" : Manager;
        var TargetComponent = isIE9OrBelow() ? "div" : Target;
        var targetProps = { innerRef: function (c) { return (_this.target = ReactDOM.findDOMNode(c)); } };
        if (isIE9OrBelow()) {
            targetProps.ref = targetProps.innerRef;
            delete targetProps.innerRef;
        }
        // TODO :: report "block" and "size" to the child popper automatically
        return (React.createElement(ManagerComponent, __assign({ className: classes, tabIndex: 0, ref: function (manager) { return (_this.manager = ReactDOM.findDOMNode(manager)); } }, props),
            React.createElement(TargetComponent, __assign({ className: this.classes("Dropdown__trigger"), onClick: this.handleClick }, targetProps), this.renderTrigger()),
            this.renderPopper(children, up)));
    };
    Dropdown.prototype.renderPopper = function (children, up) {
        var _this = this;
        if (!this.state.open) {
            return;
        }
        if (isIE9OrBelow()) {
            return (React.createElement("div", { className: this.classes("Dropdown__popper"), ref: function (c) { return (_this.popper = c); } }, children));
        }
        return (React.createElement(Portal, null,
            React.createElement(Popper, { className: this.classes("Dropdown__popper"), placement: this.getPlacement(up), innerRef: function (c) {
                    _this.popper = ReactDOM.findDOMNode(c);
                } }, children)));
    };
    return Dropdown;
}(NamespaceWrapper));
export default Dropdown;

//# sourceMappingURL=Dropdown.js.map
