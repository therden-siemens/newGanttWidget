import * as React from 'react';
import { useEffect, useState, createElement } from 'react';

/**
 * Hook to load external script.
 * @param src - Source url to load.
 * @param onLoad - Success callback.
 * @param onError - Error callback.
 */
function useLoadScript(src, onLoad, onError) {
  useEffect(() => {
    if (!document) {
      return;
    }
    // Find script tag with same src in DOM.
    const foundScript = document.querySelector('script[src="'.concat(src, '"]'));
    // Call onLoad if script marked as loaded.
    if (foundScript === null || foundScript === void 0 ? void 0 : foundScript.dataset.loaded) {
      onLoad === null || onLoad === void 0 ? void 0 : onLoad();
      return;
    }
    // Create or get existed tag.
    const script = foundScript || document.createElement("script");
    // Set src if no script was found.
    if (!foundScript) {
      script.src = src;
    }
    // Mark script as loaded on load event.
    const onLoadWithMarker = () => {
      script.dataset.loaded = "1";
      onLoad === null || onLoad === void 0 ? void 0 : onLoad();
    };
    script.addEventListener("load", onLoadWithMarker);
    if (onError) {
      script.addEventListener("error", onError);
    }
    // Add to DOM if not yet added.
    if (!foundScript) {
      document.head.append(script);
    }
    return () => {
      script.removeEventListener("load", onLoadWithMarker);
      if (onError) {
        script.removeEventListener("error", onError);
      }
    };
  }, []);
}

/**
 * Hook to load Google Charts JS API.
 * @param params - Load parameters.
 * @param [params.chartVersion] - Chart version to load.
 * @param [params.chartPackages] - Packages to load.
 * @param [params.chartLanguage] - Languages to load.
 * @param [params.mapsApiKey] - Google Maps api key.
 * @returns
 */
function useLoadGoogleCharts(param) {
  let {
    chartVersion = "current",
    chartPackages = ["corechart", "controls"],
    chartLanguage = "en",
    mapsApiKey
  } = param;
  const [googleCharts, setGoogleCharts] = useState(null);
  const [failed, setFailed] = useState(false);
  useLoadScript("https://www.gstatic.com/charts/loader.js", () => {
    // @ts-expect-error Getting object from global namespace.
    const google = window === null || window === void 0 ? void 0 : window.google;
    if (!google) {
      return;
    }
    google.charts.load(chartVersion, {
      packages: chartPackages,
      language: chartLanguage,
      mapsApiKey
    });
    google.charts.setOnLoadCallback(() => {
      setGoogleCharts(google);
    });
  }, () => {
    setFailed(true);
  });
  return [googleCharts, failed];
}
/**
 * Wrapper around useLoadGoogleCharts to use in legacy components.
 */
function LoadGoogleCharts(param) {
  let {
    onLoad,
    onError,
    ...params
  } = param;
  const [googleCharts, failed] = useLoadGoogleCharts(params);
  useEffect(() => {
    if (googleCharts && onLoad) {
      onLoad(googleCharts);
    }
  }, [googleCharts]);
  useEffect(() => {
    if (failed && onError) {
      onError();
    }
  }, [failed]);
  return null;
}
const chartDefaultProps = {
  // <DEPRECATED_PROPS>
  legend_toggle: false,
  // </DEPRECATED_PROPS>
  options: {},
  legendToggle: false,
  getChartWrapper: () => {},
  spreadSheetQueryParameters: {
    headers: 1,
    gid: 1
  },
  rootProps: {},
  chartWrapperParams: {}
};
let uniqueID = 0;
const generateUniqueID = () => {
  uniqueID += 1;
  return "reactgooglegraph-".concat(uniqueID);
};
const DEFAULT_CHART_COLORS = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#3B3EAC", "#0099C6", "#DD4477", "#66AA00", "#B82E2E", "#316395", "#994499", "#22AA99", "#AAAA11", "#6633CC", "#E67300", "#8B0707", "#329262", "#5574A6", "#3B3EAC"];
const loadDataTableFromSpreadSheet = async function (googleViz, spreadSheetUrl) {
  let urlParams = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
  return new Promise((resolve, reject) => {
    const headers = "".concat(urlParams.headers ? "headers=".concat(urlParams.headers) : "headers=0");
    const queryString = "".concat(urlParams.query ? "&tq=".concat(encodeURIComponent(urlParams.query)) : "");
    const gid = "".concat(urlParams.gid ? "&gid=".concat(urlParams.gid) : "");
    const sheet = "".concat(urlParams.sheet ? "&sheet=".concat(urlParams.sheet) : "");
    const access_token = "".concat(urlParams.access_token ? "&access_token=".concat(urlParams.access_token) : "");
    const urlQueryString = "".concat(headers).concat(gid).concat(sheet).concat(queryString).concat(access_token);
    const urlToSpreadSheet = "".concat(spreadSheetUrl, "/gviz/tq?").concat(urlQueryString); //&tq=${queryString}`;
    const query = new googleViz.visualization.Query(urlToSpreadSheet);
    query.send(response => {
      if (response.isError()) {
        reject("Error in query:  ".concat(response.getMessage(), " ").concat(response.getDetailedMessage()));
      } else {
        resolve(response.getDataTable());
      }
    });
  });
};
const {
  Provider,
  Consumer
} = /*#__PURE__*/React.createContext(chartDefaultProps);
const ContextProvider = param => {
  let {
    children,
    value
  } = param;
  return /*#__PURE__*/React.createElement(Provider, {
    value: value
  }, children);
};
const ContextConsumer = param => {
  let {
    render
  } = param;
  return /*#__PURE__*/React.createElement(Consumer, null, context => {
    return render(context);
  });
};
const GRAY_COLOR = "#CCCCCC";
class GoogleChartDataTableInner extends React.Component {
  componentDidMount() {
    this.draw(this.props);
    window.addEventListener("resize", this.onResize);
    if (this.props.legend_toggle || this.props.legendToggle) {
      this.listenToLegendToggle();
    }
  }
  componentWillUnmount() {
    const {
      google,
      googleChartWrapper
    } = this.props;
    window.removeEventListener("resize", this.onResize);
    google.visualization.events.removeAllListeners(googleChartWrapper);
    if (googleChartWrapper.getChartType() === "Timeline") {
      googleChartWrapper.getChart() && googleChartWrapper.getChart().clearChart();
    }
  }
  componentDidUpdate() {
    this.draw(this.props);
  }
  render() {
    return null;
  }
  constructor(...args) {
    super(...args);
    this.state = {
      hiddenColumns: []
    };
    this.listenToLegendToggle = () => {
      const {
        google,
        googleChartWrapper
      } = this.props;
      google.visualization.events.addListener(googleChartWrapper, "select", () => {
        const chart = googleChartWrapper.getChart();
        const selection = chart.getSelection();
        const dataTable = googleChartWrapper.getDataTable();
        if (selection.length === 0 ||
        // We want to listen to when a whole row is selected. This is the case only when row === null
        selection[0].row || !dataTable) {
          return;
        }
        const columnIndex = selection[0].column;
        const columnID = this.getColumnID(dataTable, columnIndex);
        if (this.state.hiddenColumns.includes(columnID)) {
          this.setState(state => ({
            ...state,
            hiddenColumns: [...state.hiddenColumns.filter(colID => colID !== columnID)]
          }));
        } else {
          this.setState(state => ({
            ...state,
            hiddenColumns: [...state.hiddenColumns, columnID]
          }));
        }
      });
    };
    this.applyFormatters = (dataTable, formatters) => {
      const {
        google
      } = this.props;
      for (let formatter of formatters) {
        switch (formatter.type) {
          case "ArrowFormat":
            {
              const vizFormatter = new google.visualization.ArrowFormat(formatter.options);
              vizFormatter.format(dataTable, formatter.column);
              break;
            }
          case "BarFormat":
            {
              const vizFormatter = new google.visualization.BarFormat(formatter.options);
              vizFormatter.format(dataTable, formatter.column);
              break;
            }
          case "ColorFormat":
            {
              const vizFormatter = new google.visualization.ColorFormat(formatter.options);
              const {
                ranges
              } = formatter;
              for (let range of ranges) {
                vizFormatter.addRange(...range);
              }
              vizFormatter.format(dataTable, formatter.column);
              break;
            }
          case "DateFormat":
            {
              const vizFormatter = new google.visualization.DateFormat(formatter.options);
              vizFormatter.format(dataTable, formatter.column);
              break;
            }
          case "NumberFormat":
            {
              const vizFormatter = new google.visualization.NumberFormat(formatter.options);
              vizFormatter.format(dataTable, formatter.column);
              break;
            }
          case "PatternFormat":
            {
              const vizFormatter = new google.visualization.PatternFormat(formatter.options);
              vizFormatter.format(dataTable, formatter.column);
              break;
            }
        }
      }
    };
    this.getColumnID = (dataTable, columnIndex) => {
      return dataTable.getColumnId(columnIndex) || dataTable.getColumnLabel(columnIndex);
    };
    this.draw = async param => {
      let {
        data,
        diffdata,
        rows,
        columns,
        options,
        legend_toggle,
        legendToggle,
        chartType,
        formatters,
        spreadSheetUrl,
        spreadSheetQueryParameters
      } = param;
      const {
        google,
        googleChartWrapper
      } = this.props;
      let dataTable;
      let chartDiff = null;
      if (diffdata) {
        const oldData = google.visualization.arrayToDataTable(diffdata.old);
        const newData = google.visualization.arrayToDataTable(diffdata.new);
        chartDiff = google.visualization[chartType].prototype.computeDiff(oldData, newData);
      }
      if (data !== null) {
        if (Array.isArray(data)) {
          dataTable = google.visualization.arrayToDataTable(data);
        } else {
          dataTable = new google.visualization.DataTable(data);
        }
      } else if (rows && columns) {
        dataTable = google.visualization.arrayToDataTable([columns, ...rows]);
      } else if (spreadSheetUrl) {
        dataTable = await loadDataTableFromSpreadSheet(google, spreadSheetUrl, spreadSheetQueryParameters);
      } else {
        dataTable = google.visualization.arrayToDataTable([]);
      }
      const columnCount = dataTable.getNumberOfColumns();
      for (let i = 0; i < columnCount; i += 1) {
        const columnID = this.getColumnID(dataTable, i);
        if (this.state.hiddenColumns.includes(columnID)) {
          const previousColumnLabel = dataTable.getColumnLabel(i);
          const previousColumnID = dataTable.getColumnId(i);
          const previousColumnType = dataTable.getColumnType(i);
          dataTable.removeColumn(i);
          dataTable.addColumn({
            label: previousColumnLabel,
            id: previousColumnID,
            type: previousColumnType
          });
        }
      }
      const chart = googleChartWrapper.getChart();
      if (googleChartWrapper.getChartType() === "Timeline") {
        chart && chart.clearChart();
      }
      googleChartWrapper.setChartType(chartType);
      googleChartWrapper.setOptions(options || {});
      googleChartWrapper.setDataTable(dataTable);
      googleChartWrapper.draw();
      if (this.props.googleChartDashboard !== null) {
        this.props.googleChartDashboard.draw(dataTable);
      }
      if (chartDiff) {
        googleChartWrapper.setDataTable(chartDiff);
        googleChartWrapper.draw();
      }
      if (formatters) {
        this.applyFormatters(dataTable, formatters);
        googleChartWrapper.setDataTable(dataTable);
        googleChartWrapper.draw();
      }
      if (legendToggle === true || legend_toggle === true) {
        this.grayOutHiddenColumns({
          options
        });
      }
      return;
    };
    this.grayOutHiddenColumns = param => {
      let {
        options
      } = param;
      const {
        googleChartWrapper
      } = this.props;
      const dataTable = googleChartWrapper.getDataTable();
      if (!dataTable) return;
      const columnCount = dataTable.getNumberOfColumns();
      const hasAHiddenColumn = this.state.hiddenColumns.length > 0;
      if (hasAHiddenColumn === false) return;
      const colors = Array.from({
        length: columnCount - 1
      }).map((dontcare, i) => {
        const columnID = this.getColumnID(dataTable, i + 1);
        if (this.state.hiddenColumns.includes(columnID)) {
          return GRAY_COLOR;
        } else if (options && options.colors) {
          return options.colors[i];
        } else {
          return DEFAULT_CHART_COLORS[i];
        }
      });
      googleChartWrapper.setOptions({
        ...options,
        colors
      });
      googleChartWrapper.draw();
    };
    this.onResize = () => {
      const {
        googleChartWrapper
      } = this.props;
      googleChartWrapper.draw();
    };
  }
}
class GoogleChartDataTable extends React.Component {
  componentDidMount() {}
  componentWillUnmount() {}
  shouldComponentUpdate() {
    return false;
  }
  render() {
    const {
      google,
      googleChartWrapper,
      googleChartDashboard
    } = this.props;
    return /*#__PURE__*/React.createElement(ContextConsumer, {
      render: props => {
        return /*#__PURE__*/React.createElement(GoogleChartDataTableInner, Object.assign({}, props, {
          google: google,
          googleChartWrapper: googleChartWrapper,
          googleChartDashboard: googleChartDashboard
        }));
      }
    });
  }
}
class GoogleChartEvents extends React.Component {
  shouldComponentUpdate() {
    return false;
  }
  listenToEvents(param) {
    let {
      chartEvents,
      google,
      googleChartWrapper
    } = param;
    if (!chartEvents) {
      return;
    }
    google.visualization.events.removeAllListeners(googleChartWrapper);
    for (let event of chartEvents) {
      var _this = this;
      const {
        eventName,
        callback
      } = event;
      google.visualization.events.addListener(googleChartWrapper, eventName, function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        callback({
          chartWrapper: googleChartWrapper,
          props: _this.props,
          google: google,
          eventArgs: args
        });
      });
    }
  }
  componentDidMount() {
    var ref;
    const {
      google,
      googleChartWrapper
    } = this.props;
    this.listenToEvents({
      chartEvents: ((ref = this.propsFromContext) === null || ref === void 0 ? void 0 : ref.chartEvents) || null,
      google,
      googleChartWrapper
    });
  }
  render() {
    this.props;
    return /*#__PURE__*/React.createElement(ContextConsumer, {
      render: propsFromContext => {
        this.propsFromContext = propsFromContext;
        return null;
      }
    });
  }
  constructor(props) {
    super(props);
    this.propsFromContext = null;
  }
}
let controlCounter = 0;
class GoogleChart extends React.Component {
  componentDidMount() {
    const {
      options,
      google,
      chartType,
      chartWrapperParams,
      toolbarItems,
      getChartEditor,
      getChartWrapper
    } = this.props;
    const chartConfig = {
      chartType,
      options,
      containerId: this.getGraphID(),
      ...chartWrapperParams
    };
    const googleChartWrapper = new google.visualization.ChartWrapper(chartConfig);
    googleChartWrapper.setOptions(options || {});
    if (getChartWrapper) {
      getChartWrapper(googleChartWrapper, google);
    }
    const googleChartDashboard = new google.visualization.Dashboard(this.dashboard_ref);
    const googleChartControls = this.addControls(googleChartWrapper, googleChartDashboard);
    if (toolbarItems) {
      google.visualization.drawToolbar(this.toolbar_ref.current, toolbarItems);
    }
    let googleChartEditor = null;
    if (getChartEditor) {
      googleChartEditor = new google.visualization.ChartEditor();
      getChartEditor({
        chartEditor: googleChartEditor,
        chartWrapper: googleChartWrapper,
        google
      });
    }
    this.setState({
      googleChartEditor,
      googleChartControls: googleChartControls,
      googleChartDashboard: googleChartDashboard,
      googleChartWrapper,
      isReady: true
    });
  }
  componentDidUpdate() {
    if (!this.state.googleChartWrapper) return;
    if (!this.state.googleChartDashboard) return;
    if (!this.state.googleChartControls) return;
    const {
      controls
    } = this.props;
    if (controls) {
      for (let i = 0; i < controls.length; i += 1) {
        const {
          controlType,
          options,
          controlWrapperParams
        } = controls[i];
        if (controlWrapperParams && "state" in controlWrapperParams) {
          this.state.googleChartControls[i].control.setState(controlWrapperParams["state"]);
        }
        this.state.googleChartControls[i].control.setOptions(options);
        this.state.googleChartControls[i].control.setControlType(controlType);
      }
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.isReady !== nextState.isReady || nextProps.controls !== this.props.controls;
  }
  render() {
    const {
      width,
      height,
      options,
      style
    } = this.props;
    const divStyle = {
      height: height || options && options.height,
      width: width || options && options.width,
      ...style
    };
    if (this.props.render) {
      return /*#__PURE__*/React.createElement("div", {
        ref: this.dashboard_ref,
        style: divStyle
      }, /*#__PURE__*/React.createElement("div", {
        ref: this.toolbar_ref,
        id: "toolbar"
      }), this.props.render({
        renderChart: this.renderChart,
        renderControl: this.renderControl,
        renderToolbar: this.renderToolBar
      }));
    } else {
      return /*#__PURE__*/React.createElement("div", {
        ref: this.dashboard_ref,
        style: divStyle
      }, this.renderControl(param => {
        let {
          controlProp
        } = param;
        return controlProp.controlPosition !== "bottom";
      }), this.renderChart(), this.renderControl(param => {
        let {
          controlProp
        } = param;
        return controlProp.controlPosition === "bottom";
      }), this.renderToolBar());
    }
  }
  constructor(...args1) {
    var _this1;
    super(...args1), _this1 = this;
    this.state = {
      googleChartWrapper: null,
      googleChartDashboard: null,
      googleChartControls: null,
      googleChartEditor: null,
      isReady: false
    };
    this.graphID = null;
    this.dashboard_ref = /*#__PURE__*/React.createRef();
    this.toolbar_ref = /*#__PURE__*/React.createRef();
    this.getGraphID = () => {
      const {
        graphID,
        graph_id
      } = this.props;
      let instanceGraphID;
      if (!graphID && !graph_id) {
        if (!this.graphID) {
          instanceGraphID = generateUniqueID();
        } else {
          instanceGraphID = this.graphID;
        }
      } else if (graphID && !graph_id) {
        instanceGraphID = graphID;
      } else if (graph_id && !graphID) {
        instanceGraphID = graph_id;
      } else {
        instanceGraphID = graphID;
      }
      this.graphID = instanceGraphID;
      return this.graphID;
    };
    this.getControlID = (id, index) => {
      controlCounter += 1;
      let controlID;
      if (typeof id === "undefined") {
        controlID = "googlechart-control-".concat(index, "-").concat(controlCounter);
      } else {
        controlID = id;
      }
      return controlID;
    };
    this.addControls = (googleChartWrapper, googleChartDashboard) => {
      const {
        google,
        controls
      } = this.props;
      const googleChartControls = !controls ? null : controls.map((control, i) => {
        const {
          controlID: controlIDMaybe,
          controlType,
          options: controlOptions,
          controlWrapperParams
        } = control;
        const controlID = this.getControlID(controlIDMaybe, i);
        return {
          controlProp: control,
          control: new google.visualization.ControlWrapper({
            containerId: controlID,
            controlType,
            options: controlOptions,
            ...controlWrapperParams
          })
        };
      });
      if (!googleChartControls) {
        return null;
      }
      googleChartDashboard.bind(googleChartControls.map(param => {
        let {
          control
        } = param;
        return control;
      }), googleChartWrapper);
      for (let chartControl of googleChartControls) {
        const {
          control,
          controlProp
        } = chartControl;
        const {
          controlEvents = []
        } = controlProp;
        for (let event of controlEvents) {
          var _this = this;
          const {
            callback,
            eventName
          } = event;
          google.visualization.events.removeListener(control, eventName, callback);
          google.visualization.events.addListener(control, eventName, function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }
            callback({
              chartWrapper: googleChartWrapper,
              controlWrapper: control,
              props: _this.props,
              google: google,
              eventArgs: args
            });
          });
        }
      }
      return googleChartControls;
    };
    this.renderChart = () => {
      const {
        width,
        height,
        options,
        style,
        className,
        rootProps,
        google
      } = this.props;
      const divStyle = {
        height: height || options && options.height,
        width: width || options && options.width,
        ...style
      };
      return /*#__PURE__*/React.createElement("div", Object.assign({
        id: this.getGraphID(),
        style: divStyle,
        className: className
      }, rootProps), this.state.isReady && this.state.googleChartWrapper !== null ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(GoogleChartDataTable, {
        googleChartWrapper: this.state.googleChartWrapper,
        google: google,
        googleChartDashboard: this.state.googleChartDashboard
      }), /*#__PURE__*/React.createElement(GoogleChartEvents, {
        googleChartWrapper: this.state.googleChartWrapper,
        google: google
      })) : null);
    };
    this.renderControl = function () {
      let filter = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : param => {
        return true;
      };
      return _this1.state.isReady && _this1.state.googleChartControls !== null ? /*#__PURE__*/React.createElement(React.Fragment, null, _this1.state.googleChartControls.filter(param => {
        let {
          controlProp,
          control
        } = param;
        return filter({
          control,
          controlProp
        });
      }).map(param => {
        let {
          control,
          controlProp
        } = param;
        return /*#__PURE__*/React.createElement("div", {
          key: control.getContainerId(),
          id: control.getContainerId()
        });
      })) : null;
    };
    this.renderToolBar = () => {
      if (!this.props.toolbarItems) return null;
      return /*#__PURE__*/React.createElement("div", {
        ref: this.toolbar_ref
      });
    };
  }
}
class Chart$1 extends React.Component {
  render() {
    const {
      chartLanguage,
      chartPackages,
      chartVersion,
      mapsApiKey,
      loader,
      errorElement
    } = this.props;
    return /*#__PURE__*/React.createElement(ContextProvider, {
      value: this.props
    }, this.state.loadingStatus === "ready" && this.state.google !== null ? /*#__PURE__*/React.createElement(GoogleChart, Object.assign({}, this.props, {
      google: this.state.google
    })) : this.state.loadingStatus === "errored" && errorElement ? errorElement : loader, /*#__PURE__*/React.createElement(LoadGoogleCharts, {
      chartLanguage: chartLanguage,
      chartPackages: chartPackages,
      chartVersion: chartVersion,
      mapsApiKey: mapsApiKey,
      onLoad: this.onLoad,
      onError: this.onError
    }));
  }
  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  isFullyLoaded(google) {
    const {
      controls,
      toolbarItems,
      getChartEditor
    } = this.props;
    return google && google.visualization && google.visualization.ChartWrapper && google.visualization.Dashboard && (!controls || google.visualization.ChartWrapper) && (!getChartEditor || google.visualization.ChartEditor) && (!toolbarItems || google.visualization.drawToolbar);
  }
  constructor(...args) {
    super(...args);
    this._isMounted = false;
    this.state = {
      loadingStatus: "loading",
      google: null
    };
    this.onLoad = google1 => {
      if (this.props.onLoad) {
        this.props.onLoad(google1);
      }
      if (this.isFullyLoaded(google1)) {
        this.onSuccess(google1);
      } else {
        // IE11: window.google is not fully set, we have to wait
        const id = setInterval(() => {
          const google = window.google;
          if (this._isMounted) {
            if (google && this.isFullyLoaded(google)) {
              clearInterval(id);
              this.onSuccess(google);
            }
          } else {
            clearInterval(id);
          }
        }, 1000);
      }
    };
    this.onSuccess = google => {
      this.setState({
        loadingStatus: "ready",
        google
      });
    };
    this.onError = () => {
      this.setState({
        loadingStatus: "errored"
      });
    };
  }
}
Chart$1.defaultProps = chartDefaultProps;
var GoogleDataTableColumnRoleType;
(function (GoogleDataTableColumnRoleType) {
  GoogleDataTableColumnRoleType["annotation"] = "annotation";
  GoogleDataTableColumnRoleType["annotationText"] = "annotationText";
  GoogleDataTableColumnRoleType["certainty"] = "certainty";
  GoogleDataTableColumnRoleType["emphasis"] = "emphasis";
  GoogleDataTableColumnRoleType["interval"] = "interval";
  GoogleDataTableColumnRoleType["scope"] = "scope";
  GoogleDataTableColumnRoleType["style"] = "style";
  GoogleDataTableColumnRoleType["tooltip"] = "tooltip";
  GoogleDataTableColumnRoleType["domain"] = "domain";
})(GoogleDataTableColumnRoleType || (GoogleDataTableColumnRoleType = {}));
var Chart = Chart$1;

function NewGanttWidget({ dataSource, taskId, taskName, taskResource, startDate, endDate, taskDuration, percentComplete, taskDependencies, rowDarkColor, rowNormalColor, fontSize, fontType, fontColor, ganttHeight, showCriticalPath }) {
    const [chartData, setChartData] = useState([]);
    useEffect(() => {
        const transformData = () => {
            const header = [
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
                const data = dataSource.items.map((item) => {
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
                    var _a, _b, _c, _d, _e, _f;
                    return [
                        ((_a = taskId.get(item).value) === null || _a === void 0 ? void 0 : _a.toString()) || "",
                        ((_b = taskName.get(item).value) === null || _b === void 0 ? void 0 : _b.toString()) || "Unnamed Task",
                        ((_c = taskResource.get(item).value) === null || _c === void 0 ? void 0 : _c.toString()) || "Unnamed Resource",
                        new Date(startDate.get(item).value) || new Date(),
                        new Date(endDate.get(item).value) || new Date(),
                        //new Date(2024,4,1),
                        //new Date(2024,4,9),
                        ((_d = taskDuration.get(item).value) === null || _d === void 0 ? void 0 : _d.toNumber()) || 0,
                        ((_e = percentComplete.get(item).value) === null || _e === void 0 ? void 0 : _e.toNumber()) || 0,
                        ((_f = taskDependencies.get(item).value) === null || _f === void 0 ? void 0 : _f.toString()) || ""
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
    return (createElement(Chart, { width: '100%', height: ganttHeight, chartType: "Gantt", loader: createElement("div", null, "Loading Chart..."), data: chartData, options: ganttOptions }));
}

export { NewGanttWidget };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV3R2FudHRXaWRnZXQubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVhY3QtZ29vZ2xlLWNoYXJ0cy9kaXN0L2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vc3JjL05ld0dhbnR0V2lkZ2V0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuXG4vKipcbiAqIEhvb2sgdG8gbG9hZCBleHRlcm5hbCBzY3JpcHQuXG4gKiBAcGFyYW0gc3JjIC0gU291cmNlIHVybCB0byBsb2FkLlxuICogQHBhcmFtIG9uTG9hZCAtIFN1Y2Nlc3MgY2FsbGJhY2suXG4gKiBAcGFyYW0gb25FcnJvciAtIEVycm9yIGNhbGxiYWNrLlxuICovIGZ1bmN0aW9uIHVzZUxvYWRTY3JpcHQoc3JjLCBvbkxvYWQsIG9uRXJyb3IpIHtcbiAgICB1c2VFZmZlY3QoKCk9PntcbiAgICAgICAgaWYgKCFkb2N1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZpbmQgc2NyaXB0IHRhZyB3aXRoIHNhbWUgc3JjIGluIERPTS5cbiAgICAgICAgY29uc3QgZm91bmRTY3JpcHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzY3JpcHRbc3JjPVwiJy5jb25jYXQoc3JjLCAnXCJdJykpO1xuICAgICAgICAvLyBDYWxsIG9uTG9hZCBpZiBzY3JpcHQgbWFya2VkIGFzIGxvYWRlZC5cbiAgICAgICAgaWYgKGZvdW5kU2NyaXB0ID09PSBudWxsIHx8IGZvdW5kU2NyaXB0ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBmb3VuZFNjcmlwdC5kYXRhc2V0LmxvYWRlZCkge1xuICAgICAgICAgICAgb25Mb2FkID09PSBudWxsIHx8IG9uTG9hZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25Mb2FkKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ3JlYXRlIG9yIGdldCBleGlzdGVkIHRhZy5cbiAgICAgICAgY29uc3Qgc2NyaXB0ID0gZm91bmRTY3JpcHQgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgLy8gU2V0IHNyYyBpZiBubyBzY3JpcHQgd2FzIGZvdW5kLlxuICAgICAgICBpZiAoIWZvdW5kU2NyaXB0KSB7XG4gICAgICAgICAgICBzY3JpcHQuc3JjID0gc3JjO1xuICAgICAgICB9XG4gICAgICAgIC8vIE1hcmsgc2NyaXB0IGFzIGxvYWRlZCBvbiBsb2FkIGV2ZW50LlxuICAgICAgICBjb25zdCBvbkxvYWRXaXRoTWFya2VyID0gKCk9PntcbiAgICAgICAgICAgIHNjcmlwdC5kYXRhc2V0LmxvYWRlZCA9IFwiMVwiO1xuICAgICAgICAgICAgb25Mb2FkID09PSBudWxsIHx8IG9uTG9hZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25Mb2FkKCk7XG4gICAgICAgIH07XG4gICAgICAgIHNjcmlwdC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBvbkxvYWRXaXRoTWFya2VyKTtcbiAgICAgICAgaWYgKG9uRXJyb3IpIHtcbiAgICAgICAgICAgIHNjcmlwdC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgb25FcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIHRvIERPTSBpZiBub3QgeWV0IGFkZGVkLlxuICAgICAgICBpZiAoIWZvdW5kU2NyaXB0KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZChzY3JpcHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgc2NyaXB0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIG9uTG9hZFdpdGhNYXJrZXIpO1xuICAgICAgICAgICAgaWYgKG9uRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBzY3JpcHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIG9uRXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sIFtdKTtcbn1cblxuLyoqXG4gKiBIb29rIHRvIGxvYWQgR29vZ2xlIENoYXJ0cyBKUyBBUEkuXG4gKiBAcGFyYW0gcGFyYW1zIC0gTG9hZCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIFtwYXJhbXMuY2hhcnRWZXJzaW9uXSAtIENoYXJ0IHZlcnNpb24gdG8gbG9hZC5cbiAqIEBwYXJhbSBbcGFyYW1zLmNoYXJ0UGFja2FnZXNdIC0gUGFja2FnZXMgdG8gbG9hZC5cbiAqIEBwYXJhbSBbcGFyYW1zLmNoYXJ0TGFuZ3VhZ2VdIC0gTGFuZ3VhZ2VzIHRvIGxvYWQuXG4gKiBAcGFyYW0gW3BhcmFtcy5tYXBzQXBpS2V5XSAtIEdvb2dsZSBNYXBzIGFwaSBrZXkuXG4gKiBAcmV0dXJuc1xuICovIGZ1bmN0aW9uIHVzZUxvYWRHb29nbGVDaGFydHMocGFyYW0pIHtcbiAgICBsZXQgeyBjaGFydFZlcnNpb24gPVwiY3VycmVudFwiICwgY2hhcnRQYWNrYWdlcyA9W1xuICAgICAgICBcImNvcmVjaGFydFwiLFxuICAgICAgICBcImNvbnRyb2xzXCJcbiAgICBdICwgY2hhcnRMYW5ndWFnZSA9XCJlblwiICwgbWFwc0FwaUtleSAgfSA9IHBhcmFtO1xuICAgIGNvbnN0IFtnb29nbGVDaGFydHMsIHNldEdvb2dsZUNoYXJ0c10gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbZmFpbGVkLCBzZXRGYWlsZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIHVzZUxvYWRTY3JpcHQoXCJodHRwczovL3d3dy5nc3RhdGljLmNvbS9jaGFydHMvbG9hZGVyLmpzXCIsICgpPT57XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgR2V0dGluZyBvYmplY3QgZnJvbSBnbG9iYWwgbmFtZXNwYWNlLlxuICAgICAgICBjb25zdCBnb29nbGUgPSB3aW5kb3cgPT09IG51bGwgfHwgd2luZG93ID09PSB2b2lkIDAgPyB2b2lkIDAgOiB3aW5kb3cuZ29vZ2xlO1xuICAgICAgICBpZiAoIWdvb2dsZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGdvb2dsZS5jaGFydHMubG9hZChjaGFydFZlcnNpb24sIHtcbiAgICAgICAgICAgIHBhY2thZ2VzOiBjaGFydFBhY2thZ2VzLFxuICAgICAgICAgICAgbGFuZ3VhZ2U6IGNoYXJ0TGFuZ3VhZ2UsXG4gICAgICAgICAgICBtYXBzQXBpS2V5XG4gICAgICAgIH0pO1xuICAgICAgICBnb29nbGUuY2hhcnRzLnNldE9uTG9hZENhbGxiYWNrKCgpPT57XG4gICAgICAgICAgICBzZXRHb29nbGVDaGFydHMoZ29vZ2xlKTtcbiAgICAgICAgfSk7XG4gICAgfSwgKCk9PntcbiAgICAgICAgc2V0RmFpbGVkKHRydWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBbXG4gICAgICAgIGdvb2dsZUNoYXJ0cyxcbiAgICAgICAgZmFpbGVkXG4gICAgXTtcbn1cbi8qKlxuICogV3JhcHBlciBhcm91bmQgdXNlTG9hZEdvb2dsZUNoYXJ0cyB0byB1c2UgaW4gbGVnYWN5IGNvbXBvbmVudHMuXG4gKi8gZnVuY3Rpb24gTG9hZEdvb2dsZUNoYXJ0cyhwYXJhbSkge1xuICAgIGxldCB7IG9uTG9hZCAsIG9uRXJyb3IgLCAuLi5wYXJhbXMgfSA9IHBhcmFtO1xuICAgIGNvbnN0IFtnb29nbGVDaGFydHMsIGZhaWxlZF0gPSB1c2VMb2FkR29vZ2xlQ2hhcnRzKHBhcmFtcyk7XG4gICAgdXNlRWZmZWN0KCgpPT57XG4gICAgICAgIGlmIChnb29nbGVDaGFydHMgJiYgb25Mb2FkKSB7XG4gICAgICAgICAgICBvbkxvYWQoZ29vZ2xlQ2hhcnRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtcbiAgICAgICAgZ29vZ2xlQ2hhcnRzXG4gICAgXSk7XG4gICAgdXNlRWZmZWN0KCgpPT57XG4gICAgICAgIGlmIChmYWlsZWQgJiYgb25FcnJvcikge1xuICAgICAgICAgICAgb25FcnJvcigpO1xuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICBmYWlsZWRcbiAgICBdKTtcbiAgICByZXR1cm4gbnVsbDtcbn1cblxuY29uc3QgY2hhcnREZWZhdWx0UHJvcHMgPSB7XG4gICAgLy8gPERFUFJFQ0FURURfUFJPUFM+XG4gICAgbGVnZW5kX3RvZ2dsZTogZmFsc2UsXG4gICAgLy8gPC9ERVBSRUNBVEVEX1BST1BTPlxuICAgIG9wdGlvbnM6IHt9LFxuICAgIGxlZ2VuZFRvZ2dsZTogZmFsc2UsXG4gICAgZ2V0Q2hhcnRXcmFwcGVyOiAoKT0+e30sXG4gICAgc3ByZWFkU2hlZXRRdWVyeVBhcmFtZXRlcnM6IHtcbiAgICAgICAgaGVhZGVyczogMSxcbiAgICAgICAgZ2lkOiAxXG4gICAgfSxcbiAgICByb290UHJvcHM6IHt9LFxuICAgIGNoYXJ0V3JhcHBlclBhcmFtczoge31cbn07XG5cbmxldCB1bmlxdWVJRCA9IDA7XG5jb25zdCBnZW5lcmF0ZVVuaXF1ZUlEID0gKCk9PntcbiAgICB1bmlxdWVJRCArPSAxO1xuICAgIHJldHVybiBcInJlYWN0Z29vZ2xlZ3JhcGgtXCIuY29uY2F0KHVuaXF1ZUlEKTtcbn07XG5cbmNvbnN0IERFRkFVTFRfQ0hBUlRfQ09MT1JTID0gW1xuICAgIFwiIzMzNjZDQ1wiLFxuICAgIFwiI0RDMzkxMlwiLFxuICAgIFwiI0ZGOTkwMFwiLFxuICAgIFwiIzEwOTYxOFwiLFxuICAgIFwiIzk5MDA5OVwiLFxuICAgIFwiIzNCM0VBQ1wiLFxuICAgIFwiIzAwOTlDNlwiLFxuICAgIFwiI0RENDQ3N1wiLFxuICAgIFwiIzY2QUEwMFwiLFxuICAgIFwiI0I4MkUyRVwiLFxuICAgIFwiIzMxNjM5NVwiLFxuICAgIFwiIzk5NDQ5OVwiLFxuICAgIFwiIzIyQUE5OVwiLFxuICAgIFwiI0FBQUExMVwiLFxuICAgIFwiIzY2MzNDQ1wiLFxuICAgIFwiI0U2NzMwMFwiLFxuICAgIFwiIzhCMDcwN1wiLFxuICAgIFwiIzMyOTI2MlwiLFxuICAgIFwiIzU1NzRBNlwiLFxuICAgIFwiIzNCM0VBQ1wiXG5dO1xuXG5jb25zdCBsb2FkRGF0YVRhYmxlRnJvbVNwcmVhZFNoZWV0ID0gYXN5bmMgZnVuY3Rpb24oZ29vZ2xlVml6LCBzcHJlYWRTaGVldFVybCkge1xuICAgIGxldCB1cmxQYXJhbXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gXCJcIi5jb25jYXQodXJsUGFyYW1zLmhlYWRlcnMgPyBcImhlYWRlcnM9XCIuY29uY2F0KHVybFBhcmFtcy5oZWFkZXJzKSA6IFwiaGVhZGVycz0wXCIpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IFwiXCIuY29uY2F0KHVybFBhcmFtcy5xdWVyeSA/IFwiJnRxPVwiLmNvbmNhdChlbmNvZGVVUklDb21wb25lbnQodXJsUGFyYW1zLnF1ZXJ5KSkgOiBcIlwiKTtcbiAgICAgICAgY29uc3QgZ2lkID0gXCJcIi5jb25jYXQodXJsUGFyYW1zLmdpZCA/IFwiJmdpZD1cIi5jb25jYXQodXJsUGFyYW1zLmdpZCkgOiBcIlwiKTtcbiAgICAgICAgY29uc3Qgc2hlZXQgPSBcIlwiLmNvbmNhdCh1cmxQYXJhbXMuc2hlZXQgPyBcIiZzaGVldD1cIi5jb25jYXQodXJsUGFyYW1zLnNoZWV0KSA6IFwiXCIpO1xuICAgICAgICBjb25zdCBhY2Nlc3NfdG9rZW4gPSBcIlwiLmNvbmNhdCh1cmxQYXJhbXMuYWNjZXNzX3Rva2VuID8gXCImYWNjZXNzX3Rva2VuPVwiLmNvbmNhdCh1cmxQYXJhbXMuYWNjZXNzX3Rva2VuKSA6IFwiXCIpO1xuICAgICAgICBjb25zdCB1cmxRdWVyeVN0cmluZyA9IFwiXCIuY29uY2F0KGhlYWRlcnMpLmNvbmNhdChnaWQpLmNvbmNhdChzaGVldCkuY29uY2F0KHF1ZXJ5U3RyaW5nKS5jb25jYXQoYWNjZXNzX3Rva2VuKTtcbiAgICAgICAgY29uc3QgdXJsVG9TcHJlYWRTaGVldCA9IFwiXCIuY29uY2F0KHNwcmVhZFNoZWV0VXJsLCBcIi9ndml6L3RxP1wiKS5jb25jYXQodXJsUXVlcnlTdHJpbmcpOyAvLyZ0cT0ke3F1ZXJ5U3RyaW5nfWA7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gbmV3IGdvb2dsZVZpei52aXN1YWxpemF0aW9uLlF1ZXJ5KHVybFRvU3ByZWFkU2hlZXQpO1xuICAgICAgICBxdWVyeS5zZW5kKChyZXNwb25zZSk9PntcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5pc0Vycm9yKCkpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoXCJFcnJvciBpbiBxdWVyeTogIFwiLmNvbmNhdChyZXNwb25zZS5nZXRNZXNzYWdlKCksIFwiIFwiKS5jb25jYXQocmVzcG9uc2UuZ2V0RGV0YWlsZWRNZXNzYWdlKCkpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZS5nZXREYXRhVGFibGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuY29uc3QgeyBQcm92aWRlciAsIENvbnN1bWVyICB9ID0gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVDb250ZXh0KGNoYXJ0RGVmYXVsdFByb3BzKTtcbmNvbnN0IENvbnRleHRQcm92aWRlciA9IChwYXJhbSk9PntcbiAgICBsZXQgeyBjaGlsZHJlbiAsIHZhbHVlICB9ID0gcGFyYW07XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChQcm92aWRlciwge1xuICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICB9LCBjaGlsZHJlbik7XG59O1xuY29uc3QgQ29udGV4dENvbnN1bWVyID0gKHBhcmFtKT0+e1xuICAgIGxldCB7IHJlbmRlciAgfSA9IHBhcmFtO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29uc3VtZXIsIG51bGwsIChjb250ZXh0KT0+e1xuICAgICAgICByZXR1cm4gcmVuZGVyKGNvbnRleHQpO1xuICAgIH0pO1xufTtcblxuY29uc3QgR1JBWV9DT0xPUiA9IFwiI0NDQ0NDQ1wiO1xuY2xhc3MgR29vZ2xlQ2hhcnREYXRhVGFibGVJbm5lciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZHJhdyh0aGlzLnByb3BzKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5vblJlc2l6ZSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmxlZ2VuZF90b2dnbGUgfHwgdGhpcy5wcm9wcy5sZWdlbmRUb2dnbGUpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG9MZWdlbmRUb2dnbGUoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgY29uc3QgeyBnb29nbGUgLCBnb29nbGVDaGFydFdyYXBwZXIgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgZ29vZ2xlLnZpc3VhbGl6YXRpb24uZXZlbnRzLnJlbW92ZUFsbExpc3RlbmVycyhnb29nbGVDaGFydFdyYXBwZXIpO1xuICAgICAgICBpZiAoZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldENoYXJ0VHlwZSgpID09PSBcIlRpbWVsaW5lXCIpIHtcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5nZXRDaGFydCgpICYmIGdvb2dsZUNoYXJ0V3JhcHBlci5nZXRDaGFydCgpLmNsZWFyQ2hhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIHRoaXMuZHJhdyh0aGlzLnByb3BzKTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaGlkZGVuQ29sdW1uczogW11cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5saXN0ZW5Ub0xlZ2VuZFRvZ2dsZSA9ICgpPT57XG4gICAgICAgICAgICBjb25zdCB7IGdvb2dsZSAsIGdvb2dsZUNoYXJ0V3JhcHBlciAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMuYWRkTGlzdGVuZXIoZ29vZ2xlQ2hhcnRXcmFwcGVyLCBcInNlbGVjdFwiLCAoKT0+e1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoYXJ0ID0gZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldENoYXJ0KCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gY2hhcnQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YVRhYmxlID0gZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldERhdGFUYWJsZSgpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rpb24ubGVuZ3RoID09PSAwIHx8IC8vIFdlIHdhbnQgdG8gbGlzdGVuIHRvIHdoZW4gYSB3aG9sZSByb3cgaXMgc2VsZWN0ZWQuIFRoaXMgaXMgdGhlIGNhc2Ugb25seSB3aGVuIHJvdyA9PT0gbnVsbFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvblswXS5yb3cgfHwgIWRhdGFUYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbkluZGV4ID0gc2VsZWN0aW9uWzBdLmNvbHVtbjtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JRCA9IHRoaXMuZ2V0Q29sdW1uSUQoZGF0YVRhYmxlLCBjb2x1bW5JbmRleCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGlkZGVuQ29sdW1ucy5pbmNsdWRlcyhjb2x1bW5JRCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSgoc3RhdGUpPT4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZGRlbkNvbHVtbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuaGlkZGVuQ29sdW1ucy5maWx0ZXIoKGNvbElEKT0+Y29sSUQgIT09IGNvbHVtbklEKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoKHN0YXRlKT0+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWRkZW5Db2x1bW5zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmhpZGRlbkNvbHVtbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbklEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFwcGx5Rm9ybWF0dGVycyA9IChkYXRhVGFibGUsIGZvcm1hdHRlcnMpPT57XG4gICAgICAgICAgICBjb25zdCB7IGdvb2dsZSAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBmb3IgKGxldCBmb3JtYXR0ZXIgb2YgZm9ybWF0dGVycyl7XG4gICAgICAgICAgICAgICAgc3dpdGNoKGZvcm1hdHRlci50eXBlKXtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkFycm93Rm9ybWF0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgdml6Rm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkFycm93Rm9ybWF0KGZvcm1hdHRlci5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXpGb3JtYXR0ZXIuZm9ybWF0KGRhdGFUYWJsZSwgZm9ybWF0dGVyLmNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJCYXJGb3JtYXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2aXpGb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQmFyRm9ybWF0KGZvcm1hdHRlci5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXpGb3JtYXR0ZXIuZm9ybWF0KGRhdGFUYWJsZSwgZm9ybWF0dGVyLmNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJDb2xvckZvcm1hdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZpekZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2xvckZvcm1hdChmb3JtYXR0ZXIub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyByYW5nZXMgIH0gPSBmb3JtYXR0ZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcmFuZ2Ugb2YgcmFuZ2VzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdml6Rm9ybWF0dGVyLmFkZFJhbmdlKC4uLnJhbmdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdml6Rm9ybWF0dGVyLmZvcm1hdChkYXRhVGFibGUsIGZvcm1hdHRlci5jb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRGF0ZUZvcm1hdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZpekZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRlRm9ybWF0KGZvcm1hdHRlci5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXpGb3JtYXR0ZXIuZm9ybWF0KGRhdGFUYWJsZSwgZm9ybWF0dGVyLmNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJOdW1iZXJGb3JtYXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2aXpGb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uTnVtYmVyRm9ybWF0KGZvcm1hdHRlci5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXpGb3JtYXR0ZXIuZm9ybWF0KGRhdGFUYWJsZSwgZm9ybWF0dGVyLmNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJQYXR0ZXJuRm9ybWF0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgdml6Rm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBhdHRlcm5Gb3JtYXQoZm9ybWF0dGVyLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpekZvcm1hdHRlci5mb3JtYXQoZGF0YVRhYmxlLCBmb3JtYXR0ZXIuY29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0Q29sdW1uSUQgPSAoZGF0YVRhYmxlLCBjb2x1bW5JbmRleCk9PntcbiAgICAgICAgICAgIHJldHVybiBkYXRhVGFibGUuZ2V0Q29sdW1uSWQoY29sdW1uSW5kZXgpIHx8IGRhdGFUYWJsZS5nZXRDb2x1bW5MYWJlbChjb2x1bW5JbmRleCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZHJhdyA9IGFzeW5jIChwYXJhbSk9PntcbiAgICAgICAgICAgIGxldCB7IGRhdGEgLCBkaWZmZGF0YSAsIHJvd3MgLCBjb2x1bW5zICwgb3B0aW9ucyAsIGxlZ2VuZF90b2dnbGUgLCBsZWdlbmRUb2dnbGUgLCBjaGFydFR5cGUgLCBmb3JtYXR0ZXJzICwgc3ByZWFkU2hlZXRVcmwgLCBzcHJlYWRTaGVldFF1ZXJ5UGFyYW1ldGVycyAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgY29uc3QgeyBnb29nbGUgLCBnb29nbGVDaGFydFdyYXBwZXIgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgbGV0IGRhdGFUYWJsZTtcbiAgICAgICAgICAgIGxldCBjaGFydERpZmYgPSBudWxsO1xuICAgICAgICAgICAgaWYgKGRpZmZkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkRGF0YSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoZGlmZmRhdGEub2xkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdEYXRhID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkaWZmZGF0YS5uZXcpO1xuICAgICAgICAgICAgICAgIGNoYXJ0RGlmZiA9IGdvb2dsZS52aXN1YWxpemF0aW9uW2NoYXJ0VHlwZV0ucHJvdG90eXBlLmNvbXB1dGVEaWZmKG9sZERhdGEsIG5ld0RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhVGFibGUgPSBnb29nbGUudmlzdWFsaXphdGlvbi5hcnJheVRvRGF0YVRhYmxlKGRhdGEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFUYWJsZSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChyb3dzICYmIGNvbHVtbnMpIHtcbiAgICAgICAgICAgICAgICBkYXRhVGFibGUgPSBnb29nbGUudmlzdWFsaXphdGlvbi5hcnJheVRvRGF0YVRhYmxlKFtcbiAgICAgICAgICAgICAgICAgICAgY29sdW1ucyxcbiAgICAgICAgICAgICAgICAgICAgLi4ucm93c1xuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzcHJlYWRTaGVldFVybCkge1xuICAgICAgICAgICAgICAgIGRhdGFUYWJsZSA9IGF3YWl0IGxvYWREYXRhVGFibGVGcm9tU3ByZWFkU2hlZXQoZ29vZ2xlLCBzcHJlYWRTaGVldFVybCwgc3ByZWFkU2hlZXRRdWVyeVBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYXRhVGFibGUgPSBnb29nbGUudmlzdWFsaXphdGlvbi5hcnJheVRvRGF0YVRhYmxlKFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNvbHVtbkNvdW50ID0gZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpO1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGNvbHVtbkNvdW50OyBpICs9IDEpe1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbklEID0gdGhpcy5nZXRDb2x1bW5JRChkYXRhVGFibGUsIGkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmhpZGRlbkNvbHVtbnMuaW5jbHVkZXMoY29sdW1uSUQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzQ29sdW1uTGFiZWwgPSBkYXRhVGFibGUuZ2V0Q29sdW1uTGFiZWwoaSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzQ29sdW1uSUQgPSBkYXRhVGFibGUuZ2V0Q29sdW1uSWQoaSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzQ29sdW1uVHlwZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5UeXBlKGkpO1xuICAgICAgICAgICAgICAgICAgICBkYXRhVGFibGUucmVtb3ZlQ29sdW1uKGkpO1xuICAgICAgICAgICAgICAgICAgICBkYXRhVGFibGUuYWRkQ29sdW1uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBwcmV2aW91c0NvbHVtbkxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHByZXZpb3VzQ29sdW1uSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBwcmV2aW91c0NvbHVtblR5cGVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY2hhcnQgPSBnb29nbGVDaGFydFdyYXBwZXIuZ2V0Q2hhcnQoKTtcbiAgICAgICAgICAgIGlmIChnb29nbGVDaGFydFdyYXBwZXIuZ2V0Q2hhcnRUeXBlKCkgPT09IFwiVGltZWxpbmVcIikge1xuICAgICAgICAgICAgICAgIGNoYXJ0ICYmIGNoYXJ0LmNsZWFyQ2hhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5zZXRDaGFydFR5cGUoY2hhcnRUeXBlKTtcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5zZXRPcHRpb25zKG9wdGlvbnMgfHwge30pO1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldERhdGFUYWJsZShkYXRhVGFibGUpO1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLmRyYXcoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmdvb2dsZUNoYXJ0RGFzaGJvYXJkICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nb29nbGVDaGFydERhc2hib2FyZC5kcmF3KGRhdGFUYWJsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2hhcnREaWZmKSB7XG4gICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldERhdGFUYWJsZShjaGFydERpZmYpO1xuICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5kcmF3KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZm9ybWF0dGVycykge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlGb3JtYXR0ZXJzKGRhdGFUYWJsZSwgZm9ybWF0dGVycyk7XG4gICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldERhdGFUYWJsZShkYXRhVGFibGUpO1xuICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5kcmF3KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGVnZW5kVG9nZ2xlID09PSB0cnVlIHx8IGxlZ2VuZF90b2dnbGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyYXlPdXRIaWRkZW5Db2x1bW5zKHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdyYXlPdXRIaWRkZW5Db2x1bW5zID0gKHBhcmFtKT0+e1xuICAgICAgICAgICAgbGV0IHsgb3B0aW9ucyAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgY29uc3QgeyBnb29nbGVDaGFydFdyYXBwZXIgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgZGF0YVRhYmxlID0gZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldERhdGFUYWJsZSgpO1xuICAgICAgICAgICAgaWYgKCFkYXRhVGFibGUpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGNvbHVtbkNvdW50ID0gZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpO1xuICAgICAgICAgICAgY29uc3QgaGFzQUhpZGRlbkNvbHVtbiA9IHRoaXMuc3RhdGUuaGlkZGVuQ29sdW1ucy5sZW5ndGggPiAwO1xuICAgICAgICAgICAgaWYgKGhhc0FIaWRkZW5Db2x1bW4gPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBjb2xvcnMgPSBBcnJheS5mcm9tKHtcbiAgICAgICAgICAgICAgICBsZW5ndGg6IGNvbHVtbkNvdW50IC0gMVxuICAgICAgICAgICAgfSkubWFwKChkb250Y2FyZSwgaSk9PntcbiAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JRCA9IHRoaXMuZ2V0Q29sdW1uSUQoZGF0YVRhYmxlLCBpICsgMSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGlkZGVuQ29sdW1ucy5pbmNsdWRlcyhjb2x1bW5JRCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEdSQVlfQ09MT1I7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zICYmIG9wdGlvbnMuY29sb3JzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmNvbG9yc1tpXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gREVGQVVMVF9DSEFSVF9DT0xPUlNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuc2V0T3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBjb2xvcnNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLmRyYXcoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vblJlc2l6ZSA9ICgpPT57XG4gICAgICAgICAgICBjb25zdCB7IGdvb2dsZUNoYXJ0V3JhcHBlciAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuZHJhdygpO1xuICAgICAgICB9O1xuICAgIH1cbn1cbmNsYXNzIEdvb2dsZUNoYXJ0RGF0YVRhYmxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb21wb25lbnREaWRNb3VudCgpIHt9XG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7fVxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgZ29vZ2xlICwgZ29vZ2xlQ2hhcnRXcmFwcGVyICwgZ29vZ2xlQ2hhcnREYXNoYm9hcmQgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KENvbnRleHRDb25zdW1lciwge1xuICAgICAgICAgICAgcmVuZGVyOiAocHJvcHMpPT57XG4gICAgICAgICAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChHb29nbGVDaGFydERhdGFUYWJsZUlubmVyLCBPYmplY3QuYXNzaWduKHt9LCBwcm9wcywge1xuICAgICAgICAgICAgICAgICAgICBnb29nbGU6IGdvb2dsZSxcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyOiBnb29nbGVDaGFydFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0RGFzaGJvYXJkOiBnb29nbGVDaGFydERhc2hib2FyZFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jbGFzcyBHb29nbGVDaGFydEV2ZW50cyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGxpc3RlblRvRXZlbnRzKHBhcmFtKSB7XG4gICAgICAgIGxldCB7IGNoYXJ0RXZlbnRzICwgZ29vZ2xlICwgZ29vZ2xlQ2hhcnRXcmFwcGVyICB9ID0gcGFyYW07XG4gICAgICAgIGlmICghY2hhcnRFdmVudHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMucmVtb3ZlQWxsTGlzdGVuZXJzKGdvb2dsZUNoYXJ0V3JhcHBlcik7XG4gICAgICAgIGZvciAobGV0IGV2ZW50IG9mIGNoYXJ0RXZlbnRzKXtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICBjb25zdCB7IGV2ZW50TmFtZSAsIGNhbGxiYWNrICB9ID0gZXZlbnQ7XG4gICAgICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMuYWRkTGlzdGVuZXIoZ29vZ2xlQ2hhcnRXcmFwcGVyLCBldmVudE5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKXtcbiAgICAgICAgICAgICAgICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soe1xuICAgICAgICAgICAgICAgICAgICBjaGFydFdyYXBwZXI6IGdvb2dsZUNoYXJ0V3JhcHBlcixcbiAgICAgICAgICAgICAgICAgICAgcHJvcHM6IF90aGlzLnByb3BzLFxuICAgICAgICAgICAgICAgICAgICBnb29nbGU6IGdvb2dsZSxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBcmdzOiBhcmdzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgY29uc3QgeyBnb29nbGUgLCBnb29nbGVDaGFydFdyYXBwZXIgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICB0aGlzLmxpc3RlblRvRXZlbnRzKHtcbiAgICAgICAgICAgIGNoYXJ0RXZlbnRzOiAoKHJlZiA9IHRoaXMucHJvcHNGcm9tQ29udGV4dCkgPT09IG51bGwgfHwgcmVmID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZWYuY2hhcnRFdmVudHMpIHx8IG51bGwsXG4gICAgICAgICAgICBnb29nbGUsXG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXJcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5wcm9wcztcbiAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChDb250ZXh0Q29uc3VtZXIsIHtcbiAgICAgICAgICAgIHJlbmRlcjogKHByb3BzRnJvbUNvbnRleHQpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wc0Zyb21Db250ZXh0ID0gcHJvcHNGcm9tQ29udGV4dDtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHByb3BzKXtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnByb3BzRnJvbUNvbnRleHQgPSBudWxsO1xuICAgIH1cbn1cblxubGV0IGNvbnRyb2xDb3VudGVyID0gMDtcbmNsYXNzIEdvb2dsZUNoYXJ0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgY29uc3QgeyBvcHRpb25zICwgZ29vZ2xlICwgY2hhcnRUeXBlICwgY2hhcnRXcmFwcGVyUGFyYW1zICwgdG9vbGJhckl0ZW1zICwgZ2V0Q2hhcnRFZGl0b3IgLCBnZXRDaGFydFdyYXBwZXIgLCAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IGNoYXJ0Q29uZmlnID0ge1xuICAgICAgICAgICAgY2hhcnRUeXBlLFxuICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgIGNvbnRhaW5lcklkOiB0aGlzLmdldEdyYXBoSUQoKSxcbiAgICAgICAgICAgIC4uLmNoYXJ0V3JhcHBlclBhcmFtc1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBnb29nbGVDaGFydFdyYXBwZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ2hhcnRXcmFwcGVyKGNoYXJ0Q29uZmlnKTtcbiAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldE9wdGlvbnMob3B0aW9ucyB8fCB7fSk7XG4gICAgICAgIGlmIChnZXRDaGFydFdyYXBwZXIpIHtcbiAgICAgICAgICAgIGdldENoYXJ0V3JhcHBlcihnb29nbGVDaGFydFdyYXBwZXIsIGdvb2dsZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZ29vZ2xlQ2hhcnREYXNoYm9hcmQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGFzaGJvYXJkKHRoaXMuZGFzaGJvYXJkX3JlZik7XG4gICAgICAgIGNvbnN0IGdvb2dsZUNoYXJ0Q29udHJvbHMgPSB0aGlzLmFkZENvbnRyb2xzKGdvb2dsZUNoYXJ0V3JhcHBlciwgZ29vZ2xlQ2hhcnREYXNoYm9hcmQpO1xuICAgICAgICBpZiAodG9vbGJhckl0ZW1zKSB7XG4gICAgICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5kcmF3VG9vbGJhcih0aGlzLnRvb2xiYXJfcmVmLmN1cnJlbnQsIHRvb2xiYXJJdGVtcyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGdvb2dsZUNoYXJ0RWRpdG9yID0gbnVsbDtcbiAgICAgICAgaWYgKGdldENoYXJ0RWRpdG9yKSB7XG4gICAgICAgICAgICBnb29nbGVDaGFydEVkaXRvciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5DaGFydEVkaXRvcigpO1xuICAgICAgICAgICAgZ2V0Q2hhcnRFZGl0b3Ioe1xuICAgICAgICAgICAgICAgIGNoYXJ0RWRpdG9yOiBnb29nbGVDaGFydEVkaXRvcixcbiAgICAgICAgICAgICAgICBjaGFydFdyYXBwZXI6IGdvb2dsZUNoYXJ0V3JhcHBlcixcbiAgICAgICAgICAgICAgICBnb29nbGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRFZGl0b3IsXG4gICAgICAgICAgICBnb29nbGVDaGFydENvbnRyb2xzOiBnb29nbGVDaGFydENvbnRyb2xzLFxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnREYXNoYm9hcmQ6IGdvb2dsZUNoYXJ0RGFzaGJvYXJkLFxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLFxuICAgICAgICAgICAgaXNSZWFkeTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRXcmFwcGVyKSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5nb29nbGVDaGFydERhc2hib2FyZCkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRDb250cm9scykgcmV0dXJuO1xuICAgICAgICBjb25zdCB7IGNvbnRyb2xzICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKGNvbnRyb2xzKSB7XG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgY29udHJvbHMubGVuZ3RoOyBpICs9IDEpe1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgY29udHJvbFR5cGUgLCBvcHRpb25zICwgY29udHJvbFdyYXBwZXJQYXJhbXMgIH0gPSBjb250cm9sc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoY29udHJvbFdyYXBwZXJQYXJhbXMgJiYgXCJzdGF0ZVwiIGluIGNvbnRyb2xXcmFwcGVyUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRDb250cm9sc1tpXS5jb250cm9sLnNldFN0YXRlKGNvbnRyb2xXcmFwcGVyUGFyYW1zW1wic3RhdGVcIl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmdvb2dsZUNoYXJ0Q29udHJvbHNbaV0uY29udHJvbC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRDb250cm9sc1tpXS5jb250cm9sLnNldENvbnRyb2xUeXBlKGNvbnRyb2xUeXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuaXNSZWFkeSAhPT0gbmV4dFN0YXRlLmlzUmVhZHkgfHwgbmV4dFByb3BzLmNvbnRyb2xzICE9PSB0aGlzLnByb3BzLmNvbnRyb2xzO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgd2lkdGggLCBoZWlnaHQgLCBvcHRpb25zICwgc3R5bGUgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCBkaXZTdHlsZSA9IHtcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0IHx8IG9wdGlvbnMgJiYgb3B0aW9ucy5oZWlnaHQsXG4gICAgICAgICAgICB3aWR0aDogd2lkdGggfHwgb3B0aW9ucyAmJiBvcHRpb25zLndpZHRoLFxuICAgICAgICAgICAgLi4uc3R5bGVcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVuZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgICAgICAgICByZWY6IHRoaXMuZGFzaGJvYXJkX3JlZixcbiAgICAgICAgICAgICAgICBzdHlsZTogZGl2U3R5bGVcbiAgICAgICAgICAgIH0sIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICAgICAgICAgICAgcmVmOiB0aGlzLnRvb2xiYXJfcmVmLFxuICAgICAgICAgICAgICAgIGlkOiBcInRvb2xiYXJcIlxuICAgICAgICAgICAgfSksIHRoaXMucHJvcHMucmVuZGVyKHtcbiAgICAgICAgICAgICAgICByZW5kZXJDaGFydDogdGhpcy5yZW5kZXJDaGFydCxcbiAgICAgICAgICAgICAgICByZW5kZXJDb250cm9sOiB0aGlzLnJlbmRlckNvbnRyb2wsXG4gICAgICAgICAgICAgICAgcmVuZGVyVG9vbGJhcjogdGhpcy5yZW5kZXJUb29sQmFyXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgICAgICAgICByZWY6IHRoaXMuZGFzaGJvYXJkX3JlZixcbiAgICAgICAgICAgICAgICBzdHlsZTogZGl2U3R5bGVcbiAgICAgICAgICAgIH0sIHRoaXMucmVuZGVyQ29udHJvbCgocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgbGV0IHsgY29udHJvbFByb3AgIH0gPSBwYXJhbTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbFByb3AuY29udHJvbFBvc2l0aW9uICE9PSBcImJvdHRvbVwiO1xuICAgICAgICAgICAgfSksIHRoaXMucmVuZGVyQ2hhcnQoKSwgdGhpcy5yZW5kZXJDb250cm9sKChwYXJhbSk9PntcbiAgICAgICAgICAgICAgICBsZXQgeyBjb250cm9sUHJvcCAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb250cm9sUHJvcC5jb250cm9sUG9zaXRpb24gPT09IFwiYm90dG9tXCI7XG4gICAgICAgICAgICB9KSwgdGhpcy5yZW5kZXJUb29sQmFyKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MxKXtcbiAgICAgICAgdmFyIF90aGlzMTtcbiAgICAgICAgc3VwZXIoLi4uYXJnczEpLCBfdGhpczEgPSB0aGlzO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyOiBudWxsLFxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnREYXNoYm9hcmQ6IG51bGwsXG4gICAgICAgICAgICBnb29nbGVDaGFydENvbnRyb2xzOiBudWxsLFxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRFZGl0b3I6IG51bGwsXG4gICAgICAgICAgICBpc1JlYWR5OiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdyYXBoSUQgPSBudWxsO1xuICAgICAgICB0aGlzLmRhc2hib2FyZF9yZWYgPSAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZVJlZigpO1xuICAgICAgICB0aGlzLnRvb2xiYXJfcmVmID0gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVSZWYoKTtcbiAgICAgICAgdGhpcy5nZXRHcmFwaElEID0gKCk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgZ3JhcGhJRCAsIGdyYXBoX2lkICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZUdyYXBoSUQ7XG4gICAgICAgICAgICBpZiAoIWdyYXBoSUQgJiYgIWdyYXBoX2lkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmdyYXBoSUQpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VHcmFwaElEID0gZ2VuZXJhdGVVbmlxdWVJRCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlR3JhcGhJRCA9IHRoaXMuZ3JhcGhJRDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdyYXBoSUQgJiYgIWdyYXBoX2lkKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VHcmFwaElEID0gZ3JhcGhJRDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ3JhcGhfaWQgJiYgIWdyYXBoSUQpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUdyYXBoSUQgPSBncmFwaF9pZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VHcmFwaElEID0gZ3JhcGhJRDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZ3JhcGhJRCA9IGluc3RhbmNlR3JhcGhJRDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdyYXBoSUQ7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0Q29udHJvbElEID0gKGlkLCBpbmRleCk9PntcbiAgICAgICAgICAgIGNvbnRyb2xDb3VudGVyICs9IDE7XG4gICAgICAgICAgICBsZXQgY29udHJvbElEO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xJRCA9IFwiZ29vZ2xlY2hhcnQtY29udHJvbC1cIi5jb25jYXQoaW5kZXgsIFwiLVwiKS5jb25jYXQoY29udHJvbENvdW50ZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250cm9sSUQgPSBpZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb250cm9sSUQ7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkQ29udHJvbHMgPSAoZ29vZ2xlQ2hhcnRXcmFwcGVyLCBnb29nbGVDaGFydERhc2hib2FyZCk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgZ29vZ2xlICwgY29udHJvbHMgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgZ29vZ2xlQ2hhcnRDb250cm9scyA9ICFjb250cm9scyA/IG51bGwgOiBjb250cm9scy5tYXAoKGNvbnRyb2wsIGkpPT57XG4gICAgICAgICAgICAgICAgY29uc3QgeyBjb250cm9sSUQ6IGNvbnRyb2xJRE1heWJlICwgY29udHJvbFR5cGUgLCBvcHRpb25zOiBjb250cm9sT3B0aW9ucyAsIGNvbnRyb2xXcmFwcGVyUGFyYW1zICwgIH0gPSBjb250cm9sO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRyb2xJRCA9IHRoaXMuZ2V0Q29udHJvbElEKGNvbnRyb2xJRE1heWJlLCBpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjb250cm9sUHJvcDogY29udHJvbCxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbDogbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbnRyb2xXcmFwcGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcklkOiBjb250cm9sSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbnRyb2xPcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uY29udHJvbFdyYXBwZXJQYXJhbXNcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIWdvb2dsZUNoYXJ0Q29udHJvbHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0RGFzaGJvYXJkLmJpbmQoZ29vZ2xlQ2hhcnRDb250cm9scy5tYXAoKHBhcmFtKT0+e1xuICAgICAgICAgICAgICAgIGxldCB7IGNvbnRyb2wgIH0gPSBwYXJhbTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbDtcbiAgICAgICAgICAgIH0pLCBnb29nbGVDaGFydFdyYXBwZXIpO1xuICAgICAgICAgICAgZm9yIChsZXQgY2hhcnRDb250cm9sIG9mIGdvb2dsZUNoYXJ0Q29udHJvbHMpe1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgY29udHJvbCAsIGNvbnRyb2xQcm9wICB9ID0gY2hhcnRDb250cm9sO1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgY29udHJvbEV2ZW50cyA9W10gIH0gPSBjb250cm9sUHJvcDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBldmVudCBvZiBjb250cm9sRXZlbnRzKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBjYWxsYmFjayAsIGV2ZW50TmFtZSAgfSA9IGV2ZW50O1xuICAgICAgICAgICAgICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMucmVtb3ZlTGlzdGVuZXIoY29udHJvbCwgZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZS52aXN1YWxpemF0aW9uLmV2ZW50cy5hZGRMaXN0ZW5lcihjb250cm9sLCBldmVudE5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5Kyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRXcmFwcGVyOiBnb29nbGVDaGFydFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbFdyYXBwZXI6IGNvbnRyb2wsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IF90aGlzLnByb3BzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZTogZ29vZ2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50QXJnczogYXJnc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBnb29nbGVDaGFydENvbnRyb2xzO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJlbmRlckNoYXJ0ID0gKCk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgd2lkdGggLCBoZWlnaHQgLCBvcHRpb25zICwgc3R5bGUgLCBjbGFzc05hbWUgLCByb290UHJvcHMgLCBnb29nbGUgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgZGl2U3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQgfHwgb3B0aW9ucyAmJiBvcHRpb25zLmhlaWdodCxcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGggfHwgb3B0aW9ucyAmJiBvcHRpb25zLndpZHRoLFxuICAgICAgICAgICAgICAgIC4uLnN0eWxlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICBpZDogdGhpcy5nZXRHcmFwaElEKCksXG4gICAgICAgICAgICAgICAgc3R5bGU6IGRpdlN0eWxlLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lXG4gICAgICAgICAgICB9LCByb290UHJvcHMpLCB0aGlzLnN0YXRlLmlzUmVhZHkgJiYgdGhpcy5zdGF0ZS5nb29nbGVDaGFydFdyYXBwZXIgIT09IG51bGwgPyAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChHb29nbGVDaGFydERhdGFUYWJsZSwge1xuICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlcjogdGhpcy5zdGF0ZS5nb29nbGVDaGFydFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgZ29vZ2xlOiBnb29nbGUsXG4gICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnREYXNoYm9hcmQ6IHRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnREYXNoYm9hcmRcbiAgICAgICAgICAgIH0pLCAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoR29vZ2xlQ2hhcnRFdmVudHMsIHtcbiAgICAgICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXI6IHRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRXcmFwcGVyLFxuICAgICAgICAgICAgICAgIGdvb2dsZTogZ29vZ2xlXG4gICAgICAgICAgICB9KSkgOiBudWxsKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yZW5kZXJDb250cm9sID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgZmlsdGVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMF0gOiAocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzMS5zdGF0ZS5pc1JlYWR5ICYmIF90aGlzMS5zdGF0ZS5nb29nbGVDaGFydENvbnRyb2xzICE9PSBudWxsID8gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkZyYWdtZW50LCBudWxsLCBfdGhpczEuc3RhdGUuZ29vZ2xlQ2hhcnRDb250cm9scy5maWx0ZXIoKHBhcmFtKT0+e1xuICAgICAgICAgICAgICAgIGxldCB7IGNvbnRyb2xQcm9wICwgY29udHJvbCAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIoe1xuICAgICAgICAgICAgICAgICAgICBjb250cm9sLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sUHJvcFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkubWFwKChwYXJhbSk9PntcbiAgICAgICAgICAgICAgICBsZXQgeyBjb250cm9sICwgY29udHJvbFByb3AgIH0gPSBwYXJhbTtcbiAgICAgICAgICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiBjb250cm9sLmdldENvbnRhaW5lcklkKCksXG4gICAgICAgICAgICAgICAgICAgIGlkOiBjb250cm9sLmdldENvbnRhaW5lcklkKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pKSA6IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucmVuZGVyVG9vbEJhciA9ICgpPT57XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMudG9vbGJhckl0ZW1zKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgICAgICAgICAgIHJlZjogdGhpcy50b29sYmFyX3JlZlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5jbGFzcyBDaGFydCQxIGV4dGVuZHMgKFJlYWN0LkNvbXBvbmVudCkge1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgeyBjaGFydExhbmd1YWdlICwgY2hhcnRQYWNrYWdlcyAsIGNoYXJ0VmVyc2lvbiAsIG1hcHNBcGlLZXkgLCBsb2FkZXIgLCBlcnJvckVsZW1lbnQgLCAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29udGV4dFByb3ZpZGVyLCB7XG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5wcm9wc1xuICAgICAgICB9LCB0aGlzLnN0YXRlLmxvYWRpbmdTdGF0dXMgPT09IFwicmVhZHlcIiAmJiB0aGlzLnN0YXRlLmdvb2dsZSAhPT0gbnVsbCA/IC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChHb29nbGVDaGFydCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgZ29vZ2xlOiB0aGlzLnN0YXRlLmdvb2dsZVxuICAgICAgICB9KSkgOiB0aGlzLnN0YXRlLmxvYWRpbmdTdGF0dXMgPT09IFwiZXJyb3JlZFwiICYmIGVycm9yRWxlbWVudCA/IGVycm9yRWxlbWVudCA6IGxvYWRlciwgLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KExvYWRHb29nbGVDaGFydHMsIHtcbiAgICAgICAgICAgIGNoYXJ0TGFuZ3VhZ2U6IGNoYXJ0TGFuZ3VhZ2UsXG4gICAgICAgICAgICBjaGFydFBhY2thZ2VzOiBjaGFydFBhY2thZ2VzLFxuICAgICAgICAgICAgY2hhcnRWZXJzaW9uOiBjaGFydFZlcnNpb24sXG4gICAgICAgICAgICBtYXBzQXBpS2V5OiBtYXBzQXBpS2V5LFxuICAgICAgICAgICAgb25Mb2FkOiB0aGlzLm9uTG9hZCxcbiAgICAgICAgICAgIG9uRXJyb3I6IHRoaXMub25FcnJvclxuICAgICAgICB9KSk7XG4gICAgfVxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl9pc01vdW50ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gICAgfVxuICAgIGlzRnVsbHlMb2FkZWQoZ29vZ2xlKSB7XG4gICAgICAgIGNvbnN0IHsgY29udHJvbHMgLCB0b29sYmFySXRlbXMgLCBnZXRDaGFydEVkaXRvciAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHJldHVybiBnb29nbGUgJiYgZ29vZ2xlLnZpc3VhbGl6YXRpb24gJiYgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ2hhcnRXcmFwcGVyICYmIGdvb2dsZS52aXN1YWxpemF0aW9uLkRhc2hib2FyZCAmJiAoIWNvbnRyb2xzIHx8IGdvb2dsZS52aXN1YWxpemF0aW9uLkNoYXJ0V3JhcHBlcikgJiYgKCFnZXRDaGFydEVkaXRvciB8fCBnb29nbGUudmlzdWFsaXphdGlvbi5DaGFydEVkaXRvcikgJiYgKCF0b29sYmFySXRlbXMgfHwgZ29vZ2xlLnZpc3VhbGl6YXRpb24uZHJhd1Rvb2xiYXIpO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbG9hZGluZ1N0YXR1czogXCJsb2FkaW5nXCIsXG4gICAgICAgICAgICBnb29nbGU6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vbkxvYWQgPSAoZ29vZ2xlMSk9PntcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uTG9hZCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25Mb2FkKGdvb2dsZTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuaXNGdWxseUxvYWRlZChnb29nbGUxKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub25TdWNjZXNzKGdvb2dsZTEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJRTExOiB3aW5kb3cuZ29vZ2xlIGlzIG5vdCBmdWxseSBzZXQsIHdlIGhhdmUgdG8gd2FpdFxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gc2V0SW50ZXJ2YWwoKCk9PntcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ29vZ2xlID0gd2luZG93Lmdvb2dsZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzTW91bnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdvb2dsZSAmJiB0aGlzLmlzRnVsbHlMb2FkZWQoZ29vZ2xlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25TdWNjZXNzKGdvb2dsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9uU3VjY2VzcyA9IChnb29nbGUpPT57XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nU3RhdHVzOiBcInJlYWR5XCIsXG4gICAgICAgICAgICAgICAgZ29vZ2xlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vbkVycm9yID0gKCk9PntcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmdTdGF0dXM6IFwiZXJyb3JlZFwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5DaGFydCQxLmRlZmF1bHRQcm9wcyA9IGNoYXJ0RGVmYXVsdFByb3BzO1xuXG52YXIgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGU7XG4oZnVuY3Rpb24oR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGUpIHtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcImFubm90YXRpb25cIl0gPSBcImFubm90YXRpb25cIjtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcImFubm90YXRpb25UZXh0XCJdID0gXCJhbm5vdGF0aW9uVGV4dFwiO1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1wiY2VydGFpbnR5XCJdID0gXCJjZXJ0YWludHlcIjtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcImVtcGhhc2lzXCJdID0gXCJlbXBoYXNpc1wiO1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1wiaW50ZXJ2YWxcIl0gPSBcImludGVydmFsXCI7XG4gICAgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGVbXCJzY29wZVwiXSA9IFwic2NvcGVcIjtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcInN0eWxlXCJdID0gXCJzdHlsZVwiO1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1widG9vbHRpcFwiXSA9IFwidG9vbHRpcFwiO1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1wiZG9tYWluXCJdID0gXCJkb21haW5cIjtcbn0pKEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlIHx8IChHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZSA9IHt9KSk7XG5cbnZhciBDaGFydCA9IENoYXJ0JDE7XG5cbmV4cG9ydCB7IENoYXJ0JDEgYXMgQ2hhcnQsIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlLCBDaGFydCBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXBcbiIsImltcG9ydCB7IFJlYWN0RWxlbWVudCwgY3JlYXRlRWxlbWVudCwgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgT2JqZWN0SXRlbSB9IGZyb20gJ21lbmRpeCc7XG5pbXBvcnQgQ2hhcnQgZnJvbSAncmVhY3QtZ29vZ2xlLWNoYXJ0cyc7XG5cbmltcG9ydCB7IE5ld0dhbnR0V2lkZ2V0Q29udGFpbmVyUHJvcHMgfSBmcm9tIFwiLi4vdHlwaW5ncy9OZXdHYW50dFdpZGdldFByb3BzXCI7XG5cbmltcG9ydCBcIi4vdWkvTmV3R2FudHRXaWRnZXQuY3NzXCI7XG5cbi8vIERlZmluZSBhIHR5cGUgZm9yIHRoZSByb3dzIGluIHlvdXIgY2hhcnQgZGF0YVxudHlwZSBDaGFydERhdGFUeXBlID0gKHN0cmluZyB8IERhdGUgfCBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkKVtdW107IFxuXG5leHBvcnQgZnVuY3Rpb24gTmV3R2FudHRXaWRnZXQoeyBkYXRhU291cmNlLCB0YXNrSWQsIHRhc2tOYW1lLCB0YXNrUmVzb3VyY2UsIHN0YXJ0RGF0ZSwgZW5kRGF0ZSwgdGFza0R1cmF0aW9uLCBwZXJjZW50Q29tcGxldGUsIHRhc2tEZXBlbmRlbmNpZXMsIHJvd0RhcmtDb2xvciwgcm93Tm9ybWFsQ29sb3IsIGZvbnRTaXplLCBmb250VHlwZSwgZm9udENvbG9yLCBnYW50dEhlaWdodCwgc2hvd0NyaXRpY2FsUGF0aCB9OiBOZXdHYW50dFdpZGdldENvbnRhaW5lclByb3BzKTogUmVhY3RFbGVtZW50IHtcblxuICAgIGNvbnN0IFtjaGFydERhdGEsIHNldENoYXJ0RGF0YV0gPSB1c2VTdGF0ZTxDaGFydERhdGFUeXBlPihbXSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm1EYXRhID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGVhZGVyOiAoc3RyaW5nIHwgRGF0ZSB8IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQpW11bXSA9IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnVGFzayBJRCcsIFxuICAgICAgICAgICAgICAgICAgJ1Rhc2sgTmFtZScsXG4gICAgICAgICAgICAgICAgICAnUmVzb3VyY2UnLCBcbiAgICAgICAgICAgICAgICAgICdTdGFydCBEYXRlJywgXG4gICAgICAgICAgICAgICAgICAnRW5kIERhdGUnLCBcbiAgICAgICAgICAgICAgICAgICdEdXJhdGlvbicsIFxuICAgICAgICAgICAgICAgICAgJ1BlcmNlbnQgQ29tcGxldGUnLCBcbiAgICAgICAgICAgICAgICAgICdEZXBlbmRlbmNpZXMnXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgXTtcbiBcbiAgICAgICAgICAgIGlmIChkYXRhU291cmNlICYmIGRhdGFTb3VyY2Uuc3RhdHVzID09PSAnYXZhaWxhYmxlJyAmJiBkYXRhU291cmNlLml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSXRlbXM6XCIsIGRhdGFTb3VyY2UuaXRlbXMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBkYXRhU291cmNlLml0ZW1zLm1hcCgoaXRlbTogT2JqZWN0SXRlbSkgID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSXRlbTpcIiwgaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkl0ZW0gVGFzayBJRDpcIiwgdGFza0lkLmdldChpdGVtKS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkl0ZW0gVGFzayBOYW1lOlwiLCB0YXNrTmFtZS5nZXQoaXRlbSkudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJJdGVtIFRhc2sgU3RhcnQ6XCIsIG5ldyBEYXRlKHN0YXJ0RGF0ZS5nZXQoaXRlbSkudmFsdWUhKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkl0ZW0gVGFzayBTdGFydCB0eXBlOlwiLCB0eXBlb2YobmV3IERhdGUoc3RhcnREYXRlLmdldChpdGVtKS52YWx1ZSEpKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkl0ZW0gVGFzayBFbmQ6XCIsIGVuZERhdGUuZ2V0KGl0ZW0pLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSXRlbSBUYXNrIENvbXBsZXRlOlwiLCBwZXJjZW50Q29tcGxldGUuZ2V0KGl0ZW0pLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSXRlbSBUYXNrIERlcGVuZGVuY2llczpcIiwgdGFza0RlcGVuZGVuY2llcy5nZXQoaXRlbSkudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCIxXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIk15IFN1cGVyIFRhc2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKDIwMjQsNCwxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKDIwMjQsNCw5KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAgICAgICAgICAgICA0MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICAgICAgXTsqL1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrSWQuZ2V0KGl0ZW0pLnZhbHVlPy50b1N0cmluZygpIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrTmFtZS5nZXQoaXRlbSkudmFsdWU/LnRvU3RyaW5nKCkgfHwgXCJVbm5hbWVkIFRhc2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tSZXNvdXJjZS5nZXQoaXRlbSkudmFsdWU/LnRvU3RyaW5nKCkgfHwgXCJVbm5hbWVkIFJlc291cmNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShzdGFydERhdGUuZ2V0KGl0ZW0pLnZhbHVlISkgfHwgbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKGVuZERhdGUuZ2V0KGl0ZW0pLnZhbHVlISkgfHwgbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbmV3IERhdGUoMjAyNCw0LDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9uZXcgRGF0ZSgyMDI0LDQsOSksXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrRHVyYXRpb24uZ2V0KGl0ZW0pLnZhbHVlPy50b051bWJlcigpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJjZW50Q29tcGxldGUuZ2V0KGl0ZW0pLnZhbHVlPy50b051bWJlcigpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrRGVwZW5kZW5jaWVzLmdldChpdGVtKS52YWx1ZT8udG9TdHJpbmcoKSB8fCBcIlwiXG5cbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiQ2hhcnQgZGF0YTogXCIsIGhlYWRlci5jb25jYXQoZGF0YSkpO1xuICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc2V0Q2hhcnREYXRhKGhlYWRlci5jb25jYXQoZGF0YSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChkYXRhU291cmNlKSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm1EYXRhKCk7XG4gICAgICAgIH1cbiAgICB9LCBbZGF0YVNvdXJjZV0pO1xuXG4gICAgICBjb25zdCBnYW50dE9wdGlvbnMgPSB7XG4gICAgICAgIGdhbnR0OiB7XG4gICAgICAgICAgY3JpdGljYWxQYXRoRW5hYmxlZDogc2hvd0NyaXRpY2FsUGF0aCxcbiAgICAgICAgICAvKmlubmVyR3JpZEhvcml6TGluZToge1xuICAgICAgICAgICAgc3Ryb2tlOiBcIiNmZmUwYjJcIixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAyLFxuICAgICAgICAgIH0sKi9cbiAgICAgICAgICBpbm5lckdyaWRUcmFjazogeyBmaWxsOiByb3dOb3JtYWxDb2xvciB9LFxuICAgICAgICAgIGlubmVyR3JpZERhcmtUcmFjazogeyBmaWxsOiByb3dEYXJrQ29sb3IgfSxcbiAgICAgICAgICBsYWJlbFN0eWxlOiB7XG4gICAgICAgICAgICBmb250TmFtZTogZm9udFR5cGUsXG4gICAgICAgICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICAgICAgICBjb2xvcjogZm9udENvbG9yXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxDaGFydFxuICAgICAgICAgICAgd2lkdGg9eycxMDAlJ31cbiAgICAgICAgICAgIGhlaWdodD17Z2FudHRIZWlnaHR9XG4gICAgICAgICAgICBjaGFydFR5cGU9XCJHYW50dFwiXG4gICAgICAgICAgICBsb2FkZXI9ezxkaXY+TG9hZGluZyBDaGFydC4uLjwvZGl2Pn1cbiAgICAgICAgICAgIGRhdGE9e2NoYXJ0RGF0YX1cbiAgICAgICAgICAgIG9wdGlvbnM9e2dhbnR0T3B0aW9uc31cbiAgICAgICAgICAgIFxuICAgICAgICAvPlxuICAgICk7XG59XG4iXSwibmFtZXMiOlsidXNlTG9hZFNjcmlwdCIsInNyYyIsIm9uTG9hZCIsIm9uRXJyb3IiLCJ1c2VFZmZlY3QiLCJkb2N1bWVudCIsImZvdW5kU2NyaXB0IiwicXVlcnlTZWxlY3RvciIsImNvbmNhdCIsImRhdGFzZXQiLCJsb2FkZWQiLCJzY3JpcHQiLCJjcmVhdGVFbGVtZW50Iiwib25Mb2FkV2l0aE1hcmtlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJoZWFkIiwiYXBwZW5kIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7O0FBRUE7Ozs7OztBQU1PLFNBQVNBLGFBQWFBLENBQzNCQyxHQUFXLEVBQ1hDLE1BQW1CLEVBQ25CQyxPQUFvQixFQUNwQjtBQUNBQyxFQUFBQSxTQUFTLENBQUMsTUFBTTtJQUNkLElBQUksQ0FBQ0MsUUFBUSxFQUFFO0FBQ2IsTUFBQSxPQUFBO0FBQ0QsS0FBQTs7QUFHRCxJQUFBLE1BQU1DLFdBQVcsR0FBR0QsUUFBUSxDQUFDRSxhQUFhLENBQ3hDLGNBQWEsQ0FBTUMsTUFBRSxDQUFOUCxHQUFHLEVBQUMsSUFBRSxDQUFDLENBQ3ZCLENBQUE7O0FBR0QsSUFBQSxJQUFJSyxXQUFXLEtBQUEsSUFBQSxJQUFYQSxXQUFXLEtBQUEsS0FBQSxDQUFTLEdBQXBCLEtBQUEsQ0FBb0IsR0FBcEJBLFdBQVcsQ0FBRUcsT0FBTyxDQUFDQyxNQUFNLEVBQUU7QUFDL0JSLE1BQUFBLE1BQU0sYUFBTkEsTUFBTSxLQUFJLFNBQVYsS0FBVSxDQUFBLEdBQVZBLE1BQU0sRUFBSSxDQUFBO0FBQ1YsTUFBQSxPQUFBO0FBQ0QsS0FBQTs7SUFHRCxNQUFNUyxNQUFNLEdBQUdMLFdBQVcsSUFBSUQsUUFBUSxDQUFDTyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRzlELElBQUksQ0FBQ04sV0FBVyxFQUFFO01BQ2hCSyxNQUFNLENBQUNWLEdBQUcsR0FBR0EsR0FBRyxDQUFBO0FBQ2pCLEtBQUE7O0lBR0QsTUFBTVksZ0JBQWdCLEdBQUdBLE1BQU07QUFDN0JGLE1BQUFBLE1BQU0sQ0FBQ0YsT0FBTyxDQUFDQyxNQUFNLEdBQUcsR0FBRyxDQUFBO0FBQzNCUixNQUFBQSxNQUFNLGFBQU5BLE1BQU0sS0FBSSxTQUFWLEtBQVUsQ0FBQSxHQUFWQSxNQUFNLEVBQUksQ0FBQTtBQUNYLEtBQUEsQ0FBQTtBQUVEUyxJQUFBQSxNQUFNLENBQUNHLGdCQUFnQixDQUFDLE1BQU0sRUFBRUQsZ0JBQWdCLENBQUMsQ0FBQTtBQUVqRCxJQUFBLElBQUlWLE9BQU8sRUFBRTtBQUNYUSxNQUFBQSxNQUFNLENBQUNHLGdCQUFnQixDQUFDLE9BQU8sRUFBRVgsT0FBTyxDQUFDLENBQUE7QUFDMUMsS0FBQTs7SUFHRCxJQUFJLENBQUNHLFdBQVcsRUFBRTtBQUNoQkQsTUFBQUEsUUFBUSxDQUFDVSxJQUFJLENBQUNDLE1BQU0sQ0FBQ0wsTUFBTSxDQUFDLENBQUE7QUFDN0IsS0FBQTtBQUVELElBQUEsT0FBTyxNQUFNO0FBQ1hBLE1BQUFBLE1BQU0sQ0FBQ00sbUJBQW1CLENBQUMsTUFBTSxFQUFFSixnQkFBZ0IsQ0FBQyxDQUFBO0FBRXBELE1BQUEsSUFBSVYsT0FBTyxFQUFFO0FBQ1hRLFFBQUFBLE1BQU0sQ0FBQ00sbUJBQW1CLENBQUMsT0FBTyxFQUFFZCxPQUFPLENBQUMsQ0FBQTtBQUM3QyxPQUFBO0FBQ0YsS0FBQSxDQUFBO0FBQ0YsR0FBQSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ1AsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ25EZSxTQUFBLGNBQWMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQWdDLEVBQUE7SUFFeFEsTUFBTSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsR0FBRyxRQUFRLENBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBRTlELFNBQVMsQ0FBQyxNQUFLO1FBQ1gsTUFBTSxhQUFhLEdBQUcsTUFBSztBQUN2QixZQUFBLE1BQU0sTUFBTSxHQUFvRDtBQUM1RCxnQkFBQTtvQkFDRSxTQUFTO29CQUNULFdBQVc7b0JBQ1gsVUFBVTtvQkFDVixZQUFZO29CQUNaLFVBQVU7b0JBQ1YsVUFBVTtvQkFDVixrQkFBa0I7b0JBQ2xCLGNBQWM7QUFDZixpQkFBQTthQUNGLENBQUM7WUFFSixJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLFdBQVcsSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFO2dCQUNyRSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3pDLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBZ0IsS0FBSztBQUNwRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JJOztvQkFFSixPQUFPO0FBQ0gsd0JBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBRSxRQUFRLEVBQUUsS0FBSSxFQUFFO0FBQ3hDLHdCQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUUsUUFBUSxFQUFFLEtBQUksY0FBYztBQUN0RCx3QkFBQSxDQUFBLENBQUEsRUFBQSxHQUFBLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFFLFFBQVEsRUFBRSxLQUFJLGtCQUFrQjtBQUM5RCx3QkFBQSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2xELHdCQUFBLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBTSxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUU7OztBQUdoRCx3QkFBQSxDQUFBLENBQUEsRUFBQSxHQUFBLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFFLFFBQVEsRUFBRSxLQUFJLENBQUM7QUFDN0Msd0JBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBRSxRQUFRLEVBQUUsS0FBSSxDQUFDO0FBQ2hELHdCQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBRSxRQUFRLEVBQUUsS0FBSSxFQUFFO3FCQUVyRCxDQUFDO0FBQ04saUJBQUMsQ0FBQyxDQUFDO0FBSUgsZ0JBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUlsRCxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLGFBQUE7QUFDTCxTQUFDLENBQUM7QUFFRixRQUFBLElBQUksVUFBVSxFQUFFO0FBQ1osWUFBQSxhQUFhLEVBQUUsQ0FBQztBQUNuQixTQUFBO0FBQ0wsS0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUVmLElBQUEsTUFBTSxZQUFZLEdBQUc7QUFDbkIsUUFBQSxLQUFLLEVBQUU7QUFDTCxZQUFBLG1CQUFtQixFQUFFLGdCQUFnQjtBQUNyQzs7O0FBR0k7QUFDSixZQUFBLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUU7QUFDeEMsWUFBQSxrQkFBa0IsRUFBRSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUU7QUFDMUMsWUFBQSxVQUFVLEVBQUU7QUFDVixnQkFBQSxRQUFRLEVBQUUsUUFBUTtBQUNsQixnQkFBQSxRQUFRLEVBQUUsUUFBUTtBQUNsQixnQkFBQSxLQUFLLEVBQUUsU0FBUztBQUNqQixhQUFBO0FBQ0YsU0FBQTtLQUNGLENBQUM7QUFFSixJQUFBLFFBQ0ksYUFBQSxDQUFDLEtBQUssRUFBQSxFQUNGLEtBQUssRUFBRSxNQUFNLEVBQ2IsTUFBTSxFQUFFLFdBQVcsRUFDbkIsU0FBUyxFQUFDLE9BQU8sRUFDakIsTUFBTSxFQUFFLGFBQTJCLENBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxrQkFBQSxDQUFBLEVBQ25DLElBQUksRUFBRSxTQUFTLEVBQ2YsT0FBTyxFQUFFLFlBQVksRUFBQSxDQUV2QixFQUNKO0FBQ047Ozs7In0=
