import { ReactElement, createElement, useEffect, useState } from "react";
import { ObjectItem, EditableValue } from 'mendix';
import Chart from 'react-google-charts';

import { NewGanttWidgetContainerProps } from "../typings/NewGanttWidgetProps";

import "./ui/NewGanttWidget.css";

type ChartDataType = (string | Date | number | null)[][]; 

function ensureDate(dateValue: EditableValue<Date>): Date | string | null {
    if (!dateValue || dateValue.status !== "available" || dateValue.value === undefined) return null;
    const date = new Date(dateValue.value);
    if (isNaN(date.getTime())) return null;
    
    // Format 1: Return as is (JavaScript Date object)
    return date;
    
    // Format 2: ISO string
    //return date.toISOString();
    
    // Format 3: Specific string format
    //return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

export function NewGanttWidget({ dataSource, taskId, taskName, taskResource, startDate, endDate, taskDuration, percentComplete, taskDependencies, rowDarkColor, rowNormalColor, fontSize, fontType, fontColor, ganttHeight, showCriticalPath }: NewGanttWidgetContainerProps): ReactElement {

    const [chartData, setChartData] = useState<ChartDataType>([]);

    useEffect(() => {
        const transformData = () => {
            const header: ChartDataType = [
                [
                  'Task ID', 
                  'Task Name',
                  'Resource', 
                  'Start Date', 
                  'End Date', 
                  'Duration', 
                  'Percent Complete', 
                  'Dependencies'
                ],
              ];
 
            if (dataSource && dataSource.status === 'available' && dataSource.items) {
                console.info("Items:", dataSource.items);
                const data = dataSource.items.map((item: ObjectItem): (string | Date | number | null)[]  => {
                    const rowData = [
                        taskId.get(item).value?.toString() || "",
                        taskName.get(item).value?.toString() || "Unnamed Task",
                        taskResource.get(item).value?.toString() || "Unnamed Resource",
                        ensureDate(startDate.get(item)),
                        ensureDate(endDate.get(item)),
                        taskDuration.get(item).value?.toNumber() || 0,
                        percentComplete.get(item).value?.toNumber() || 0,
                        taskDependencies.get(item).value?.toString() || ""
                    ];
                    console.log('Row data:', rowData);
                    return rowData;
                });

                console.info("Chart data: ", header.concat(data));
                setChartData(header.concat(data));
            }
        };

        if (dataSource) {
            transformData();
        }
    }, [dataSource, taskId, taskName, taskResource, startDate, endDate, taskDuration, percentComplete, taskDependencies]);

    const ganttOptions = {
        gantt: {
          criticalPathEnabled: showCriticalPath,
          innerGridTrack: { fill: rowNormalColor },
          innerGridDarkTrack: { fill: rowDarkColor },
          timezone: 'GMT', // or your specific timezone
          labelStyle: {
            fontName: fontType,
            fontSize: fontSize,
            color: fontColor
          }
        },
    };

    return (
        <Chart
            width={'100%'}
            height={ganttHeight}
            chartType="Gantt"
            loader={<div>Loading Chart...</div>}
            data={chartData}
            options={ganttOptions}
        />
    );
}