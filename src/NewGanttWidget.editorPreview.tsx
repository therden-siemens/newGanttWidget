import { ReactElement, createElement } from "react";
import { NewGanttWidgetPreviewProps } from "../typings/NewGanttWidgetProps";
//import Chart from 'react-google-charts';

export function preview({ }: NewGanttWidgetPreviewProps): ReactElement {
    /*
    const dummyData: (string | Date | number | null)[][] = [
                [
                  'Task ID', 
                  'Task Name', 
                  'Start Date', 
                  'End Date', 
                  'Duration', 
                  'Percent Complete', 
                  'Dependencies'
                ],
                ["1",
                "Order parts",
                new Date(2024,4,1),
                new Date(2024,4,3),
                null,
                40,
                null],
                ["2",
                "Repair",
                new Date(2024,4,3),
                new Date(2024,4,9),
                null,
                0,
                1],
                ["3",
                "Maintenance",
                new Date(2024,4,9),
                new Date(2024,4,11),
                null,
                0,
                "1,2"]
              ];

    return (
        <Chart
            width={'100%'}
            height={'300px'}
            chartType="Gantt"
            loader={<div>Loading Chart...</div>}
            data={dummyData}
        />
    );*/

    return (
        <div className="card">
            The Gantt Chart will render here
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/NewGanttWidget.css");
}
