'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function getProperties(_values, defaultProperties /* , target: Platform*/) {
  // Do the values manipulation here to control the visibility of properties in Studio and Studio Pro conditionally.
  /* Example
  if (values.myProperty === "custom") {
      delete defaultProperties.properties.myOtherProperty;
  }
  */
  return defaultProperties;
}
// export function check(_values: NewGanttWidgetPreviewProps): Problem[] {
//     const errors: Problem[] = [];
//     // Add errors to the above array to throw errors in Studio and Studio Pro.
//     /* Example
//     if (values.myProperty !== "custom") {
//         errors.push({
//             property: `myProperty`,
//             message: `The value of 'myProperty' is different of 'custom'.`,
//             url: "https://github.com/myrepo/mywidget"
//         });
//     }
//     */
//     return errors;
// }
// export function getPreview(values: NewGanttWidgetPreviewProps, isDarkMode: boolean, version: number[]): PreviewProps {
//     // Customize your pluggable widget appearance for Studio Pro.
//     return {
//         type: "Container",
//         children: []
//     }
// }
// export function getCustomCaption(values: NewGanttWidgetPreviewProps, platform: Platform): string {
//     return "NewGanttWidget";
// }

exports.getProperties = getProperties;
