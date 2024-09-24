/**
 * This file was generated from NewGanttWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export interface NewGanttWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dataSource: ListValue;
    taskId: ListAttributeValue<string>;
    taskName: ListAttributeValue<string>;
    taskResource: ListAttributeValue<string>;
    startDate: ListAttributeValue<Date>;
    endDate: ListAttributeValue<Date>;
    taskDuration: ListAttributeValue<Big>;
    percentComplete: ListAttributeValue<Big>;
    taskDependencies: ListAttributeValue<string>;
    showCriticalPath: boolean;
    ganttHeight: number;
    fontType: string;
    fontSize: number;
    fontColor: string;
    rowNormalColor: string;
    rowDarkColor: string;
}

export interface NewGanttWidgetPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    dataSource: {} | { caption: string } | { type: string } | null;
    taskId: string;
    taskName: string;
    taskResource: string;
    startDate: string;
    endDate: string;
    taskDuration: string;
    percentComplete: string;
    taskDependencies: string;
    showCriticalPath: boolean;
    ganttHeight: number | null;
    fontType: string;
    fontSize: number | null;
    fontColor: string;
    rowNormalColor: string;
    rowDarkColor: string;
}
