/// <reference types="react" />
import * as React from "react";
import NamespaceWrapper, { NamespaceWrapperProps } from "../utils/NamespaceWrapper";
export interface DropdownProps extends NamespaceWrapperProps {
    disabled?: boolean;
    up?: boolean;
    open?: boolean;
    block?: boolean;
    size?: "small" | "medium" | "large";
    className?: string;
    trigger: ((isOpen: boolean, caret: React.ReactNode) => React.ReactNode) | React.ReactNode;
    style?: React.CSSProperties;
}
export interface DropdownState {
    open?: boolean;
}
export default class Dropdown extends NamespaceWrapper<DropdownProps, DropdownState> {
    outsideTap: any;
    manager: Element;
    popper: Element;
    target: Element;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(lastProps: any, lastState: any): void;
    componentWillReceiveProps(nextProps: any): void;
    componentWillUnmount(): void;
    private setOusideTap;
    handleOutsideTap: () => void;
    handleClick: (event: any) => void;
    renderTrigger(): React.ReactNode;
    getPlacement(up: boolean): "top-end" | "bottom-end" | "top-start" | "bottom-start";
    render(): JSX.Element;
    renderPopper(children: any, up: any): JSX.Element;
}
