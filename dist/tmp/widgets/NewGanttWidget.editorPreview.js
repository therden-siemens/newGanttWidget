'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');

function getDefaultExportFromNamespaceIfNotNamed (n) {
	return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
}

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;
  if (!css || typeof document === 'undefined') {
    return;
  }
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "/*\nPlace your custom CSS here\n*/\n.widget-hello-world {\n\n}\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5ld0dhbnR0V2lkZ2V0LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Q0FFQztBQUNEOztBQUVBIiwiZmlsZSI6Ik5ld0dhbnR0V2lkZ2V0LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5QbGFjZSB5b3VyIGN1c3RvbSBDU1MgaGVyZVxuKi9cbi53aWRnZXQtaGVsbG8td29ybGQge1xuXG59XG4iXX0= */";
var stylesheet="/*\nPlace your custom CSS here\n*/\n.widget-hello-world {\n\n}\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5ld0dhbnR0V2lkZ2V0LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Q0FFQztBQUNEOztBQUVBIiwiZmlsZSI6Ik5ld0dhbnR0V2lkZ2V0LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5QbGFjZSB5b3VyIGN1c3RvbSBDU1MgaGVyZVxuKi9cbi53aWRnZXQtaGVsbG8td29ybGQge1xuXG59XG4iXX0= */";
styleInject(css_248z);

var NewGanttWidget = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': css_248z,
	stylesheet: stylesheet
});

var require$$0 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(NewGanttWidget);

//import Chart from 'react-google-charts';
function preview({}) {
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
    return (react.createElement("div", { className: "card" }, "The Gantt Chart will render here"));
}
function getPreviewCss() {
    return require$$0;
}

exports.getPreviewCss = getPreviewCss;
exports.preview = preview;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV3R2FudHRXaWRnZXQuZWRpdG9yUHJldmlldy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWluamVjdC9kaXN0L3N0eWxlLWluamVjdC5lcy5qcyIsIi4uLy4uLy4uL3NyYy9OZXdHYW50dFdpZGdldC5lZGl0b3JQcmV2aWV3LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBzdHlsZUluamVjdChjc3MsIHJlZikge1xuICBpZiAoIHJlZiA9PT0gdm9pZCAwICkgcmVmID0ge307XG4gIHZhciBpbnNlcnRBdCA9IHJlZi5pbnNlcnRBdDtcblxuICBpZiAoIWNzcyB8fCB0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7IHJldHVybjsgfVxuXG4gIHZhciBoZWFkID0gZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJztcblxuICBpZiAoaW5zZXJ0QXQgPT09ICd0b3AnKSB7XG4gICAgaWYgKGhlYWQuZmlyc3RDaGlsZCkge1xuICAgICAgaGVhZC5pbnNlcnRCZWZvcmUoc3R5bGUsIGhlYWQuZmlyc3RDaGlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgfVxuXG4gIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0eWxlSW5qZWN0O1xuIiwiaW1wb3J0IHsgUmVhY3RFbGVtZW50LCBjcmVhdGVFbGVtZW50IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBOZXdHYW50dFdpZGdldFByZXZpZXdQcm9wcyB9IGZyb20gXCIuLi90eXBpbmdzL05ld0dhbnR0V2lkZ2V0UHJvcHNcIjtcbi8vaW1wb3J0IENoYXJ0IGZyb20gJ3JlYWN0LWdvb2dsZS1jaGFydHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJldmlldyh7IH06IE5ld0dhbnR0V2lkZ2V0UHJldmlld1Byb3BzKTogUmVhY3RFbGVtZW50IHtcbiAgICAvKlxuICAgIGNvbnN0IGR1bW15RGF0YTogKHN0cmluZyB8IERhdGUgfCBudW1iZXIgfCBudWxsKVtdW10gPSBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1Rhc2sgSUQnLCBcbiAgICAgICAgICAgICAgICAgICdUYXNrIE5hbWUnLCBcbiAgICAgICAgICAgICAgICAgICdTdGFydCBEYXRlJywgXG4gICAgICAgICAgICAgICAgICAnRW5kIERhdGUnLCBcbiAgICAgICAgICAgICAgICAgICdEdXJhdGlvbicsIFxuICAgICAgICAgICAgICAgICAgJ1BlcmNlbnQgQ29tcGxldGUnLCBcbiAgICAgICAgICAgICAgICAgICdEZXBlbmRlbmNpZXMnXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXCIxXCIsXG4gICAgICAgICAgICAgICAgXCJPcmRlciBwYXJ0c1wiLFxuICAgICAgICAgICAgICAgIG5ldyBEYXRlKDIwMjQsNCwxKSxcbiAgICAgICAgICAgICAgICBuZXcgRGF0ZSgyMDI0LDQsMyksXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICA0MCxcbiAgICAgICAgICAgICAgICBudWxsXSxcbiAgICAgICAgICAgICAgICBbXCIyXCIsXG4gICAgICAgICAgICAgICAgXCJSZXBhaXJcIixcbiAgICAgICAgICAgICAgICBuZXcgRGF0ZSgyMDI0LDQsMyksXG4gICAgICAgICAgICAgICAgbmV3IERhdGUoMjAyNCw0LDkpLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAxXSxcbiAgICAgICAgICAgICAgICBbXCIzXCIsXG4gICAgICAgICAgICAgICAgXCJNYWludGVuYW5jZVwiLFxuICAgICAgICAgICAgICAgIG5ldyBEYXRlKDIwMjQsNCw5KSxcbiAgICAgICAgICAgICAgICBuZXcgRGF0ZSgyMDI0LDQsMTEpLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBcIjEsMlwiXVxuICAgICAgICAgICAgICBdO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPENoYXJ0XG4gICAgICAgICAgICB3aWR0aD17JzEwMCUnfVxuICAgICAgICAgICAgaGVpZ2h0PXsnMzAwcHgnfVxuICAgICAgICAgICAgY2hhcnRUeXBlPVwiR2FudHRcIlxuICAgICAgICAgICAgbG9hZGVyPXs8ZGl2PkxvYWRpbmcgQ2hhcnQuLi48L2Rpdj59XG4gICAgICAgICAgICBkYXRhPXtkdW1teURhdGF9XG4gICAgICAgIC8+XG4gICAgKTsqL1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjYXJkXCI+XG4gICAgICAgICAgICBUaGUgR2FudHQgQ2hhcnQgd2lsbCByZW5kZXIgaGVyZVxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJldmlld0NzcygpOiBzdHJpbmcge1xuICAgIHJldHVybiByZXF1aXJlKFwiLi91aS9OZXdHYW50dFdpZGdldC5jc3NcIik7XG59XG4iXSwibmFtZXMiOlsic3R5bGVJbmplY3QiLCJjc3MiLCJyZWYiLCJpbnNlcnRBdCIsImRvY3VtZW50IiwiaGVhZCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwic3R5bGUiLCJjcmVhdGVFbGVtZW50IiwidHlwZSIsImZpcnN0Q2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRDaGlsZCIsInN0eWxlU2hlZXQiLCJjc3NUZXh0IiwiY3JlYXRlVGV4dE5vZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxXQUFXQSxDQUFDQyxHQUFHLEVBQUVDLEdBQUcsRUFBRTtFQUM3QixJQUFLQSxHQUFHLEtBQUssS0FBSyxDQUFDLEVBQUdBLEdBQUcsR0FBRyxFQUFFLENBQUE7QUFDOUIsRUFBQSxJQUFJQyxRQUFRLEdBQUdELEdBQUcsQ0FBQ0MsUUFBUSxDQUFBO0FBRTNCLEVBQUEsSUFBSSxDQUFDRixHQUFHLElBQUksT0FBT0csUUFBUSxLQUFLLFdBQVcsRUFBRTtBQUFFLElBQUEsT0FBQTtBQUFRLEdBQUE7QUFFdkQsRUFBQSxJQUFJQyxJQUFJLEdBQUdELFFBQVEsQ0FBQ0MsSUFBSSxJQUFJRCxRQUFRLENBQUNFLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3BFLEVBQUEsSUFBSUMsS0FBSyxHQUFHSCxRQUFRLENBQUNJLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtFQUMzQ0QsS0FBSyxDQUFDRSxJQUFJLEdBQUcsVUFBVSxDQUFBO0VBRXZCLElBQUlOLFFBQVEsS0FBSyxLQUFLLEVBQUU7SUFDdEIsSUFBSUUsSUFBSSxDQUFDSyxVQUFVLEVBQUU7TUFDbkJMLElBQUksQ0FBQ00sWUFBWSxDQUFDSixLQUFLLEVBQUVGLElBQUksQ0FBQ0ssVUFBVSxDQUFDLENBQUE7QUFDM0MsS0FBQyxNQUFNO0FBQ0xMLE1BQUFBLElBQUksQ0FBQ08sV0FBVyxDQUFDTCxLQUFLLENBQUMsQ0FBQTtBQUN6QixLQUFBO0FBQ0YsR0FBQyxNQUFNO0FBQ0xGLElBQUFBLElBQUksQ0FBQ08sV0FBVyxDQUFDTCxLQUFLLENBQUMsQ0FBQTtBQUN6QixHQUFBO0VBRUEsSUFBSUEsS0FBSyxDQUFDTSxVQUFVLEVBQUU7QUFDcEJOLElBQUFBLEtBQUssQ0FBQ00sVUFBVSxDQUFDQyxPQUFPLEdBQUdiLEdBQUcsQ0FBQTtBQUNoQyxHQUFDLE1BQU07SUFDTE0sS0FBSyxDQUFDSyxXQUFXLENBQUNSLFFBQVEsQ0FBQ1csY0FBYyxDQUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQ2pELEdBQUE7QUFDRjs7Ozs7Ozs7Ozs7Ozs7QUN2QkE7QUFFTSxTQUFVLE9BQU8sQ0FBQyxFQUErQixFQUFBO0FBQ25EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwQ0k7QUFFSixJQUFBLFFBQ0lPLG1CQUFLLENBQUEsS0FBQSxFQUFBLEVBQUEsU0FBUyxFQUFDLE1BQU0sRUFBQSxFQUFBLGtDQUFBLENBRWYsRUFDUjtBQUNOLENBQUM7U0FFZSxhQUFhLEdBQUE7QUFDekIsSUFBQSxPQUFPLFVBQWtDLENBQUM7QUFDOUM7Ozs7OyJ9
