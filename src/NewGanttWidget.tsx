import { ReactElement, createElement, useEffect, useState } from "react";
import { ObjectItem } from 'mendix';
import Chart from 'react-google-charts';

import { NewGanttWidgetContainerProps } from "../typings/NewGanttWidgetProps";

import "./ui/NewGanttWidget.css";

// Define a type for the rows in your chart data
type ChartDataType = (string | Date | number | null | undefined)[][]; 

export function NewGanttWidget({ dataSource, taskId, taskName, taskResource, startDate, endDate, taskDuration, percentComplete, taskDependencies, rowDarkColor, rowNormalColor, fontSize, fontType, fontColor, ganttHeight, showCriticalPath }: NewGanttWidgetContainerProps): ReactElement {

    const [chartData, setChartData] = useState<ChartDataType>([]);

    useEffect(() => {
        const transformData = () => {
            const header: (string | Date | number | null | undefined)[][] = [
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
                const data = dataSource.items.map((item: ObjectItem)  => {
                    /*
                    console.info("Item:", item);
                    console.info("Item Task ID:", taskId.get(item).value);
                    console.info("Item Task Name:", taskName.get(item).value);
                    console.info("Item Task Start:", new Date(startDate.get(item).value!));
                    console.info("Item Task Start type:", typeof(new Date(startDate.get(item).value!)));
                    console.info("Item Task End:", endDate.get(item).value);
                    console.info("Item Task Complete:", percentComplete.get(item).value);
                    console.info("Item Task Dependencies:", taskDependencies.get(item).value);
                   
                    return [
                        "1",
                        "My Super Task",
                        new Date(2024,4,1),
                        new Date(2024,4,9),
                        8,
                        40,
                        null
                    ];*/

                    return [
                        taskId.get(item).value?.toString() || "",
                        taskName.get(item).value?.toString() || "Unnamed Task",
                        taskResource.get(item).value?.toString() || "Unnamed Resource",
                        new Date(startDate.get(item).value!) || new Date(),
                        new Date(endDate.get(item).value!) || new Date(),
                        //new Date(2024,4,1),
                        //new Date(2024,4,9),
                        taskDuration.get(item).value?.toNumber() || 0,
                        percentComplete.get(item).value?.toNumber() || 0,
                        taskDependencies.get(item).value?.toString() || ""

                    ];
                });


                
                console.info("Chart data: ", header.concat(data));
                

                
                setChartData(header.concat(data));
            }
        };

        if (dataSource) {
            transformData();
        }
    }, [dataSource]);

      const ganttOptions = {
        gantt: {
          criticalPathEnabled: showCriticalPath,
          /*innerGridHorizLine: {
            stroke: "#ffe0b2",
            strokeWidth: 2,
          },*/
          innerGridTrack: { fill: rowNormalColor },
          innerGridDarkTrack: { fill: rowDarkColor },
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
