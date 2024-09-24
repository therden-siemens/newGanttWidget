
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
      if (data) {
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
      const viewColumns = Array(columnCount).fill(0).map((c, i) => {
        const columnID = this.getColumnID(dataTable, i);
        if (this.state.hiddenColumns.includes(columnID)) {
          return {
            label: dataTable.getColumnLabel(i),
            type: dataTable.getColumnType(i),
            calc: () => null
          };
        } else {
          return i;
        }
      });
      const chart = googleChartWrapper.getChart();
      if (googleChartWrapper.getChartType() === "Timeline") {
        chart && chart.clearChart();
      }
      googleChartWrapper.setChartType(chartType);
      googleChartWrapper.setOptions(options || {});
      const viewTable = new google.visualization.DataView(dataTable);
      viewTable.setColumns(viewColumns);
      googleChartWrapper.setDataTable(viewTable);
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

function ensureDate(dateValue) {
    if (!dateValue || dateValue.status !== "available" || dateValue.value === undefined)
        return null;
    const date = new Date(dateValue.value);
    if (isNaN(date.getTime()))
        return null;
    // Format 1: Return as is (JavaScript Date object)
    return date;
    // Format 2: ISO string
    //return date.toISOString();
    // Format 3: Specific string format
    //return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}
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
                    var _a, _b, _c, _d, _e, _f;
                    const rowData = [
                        ((_a = taskId.get(item).value) === null || _a === void 0 ? void 0 : _a.toString()) || "",
                        ((_b = taskName.get(item).value) === null || _b === void 0 ? void 0 : _b.toString()) || "Unnamed Task",
                        ((_c = taskResource.get(item).value) === null || _c === void 0 ? void 0 : _c.toString()) || "Unnamed Resource",
                        ensureDate(startDate.get(item)),
                        ensureDate(endDate.get(item)),
                        ((_d = taskDuration.get(item).value) === null || _d === void 0 ? void 0 : _d.toNumber()) || 0,
                        ((_e = percentComplete.get(item).value) === null || _e === void 0 ? void 0 : _e.toNumber()) || 0,
                        ((_f = taskDependencies.get(item).value) === null || _f === void 0 ? void 0 : _f.toString()) || ""
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
            timezone: 'GMT',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV3R2FudHRXaWRnZXQubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVhY3QtZ29vZ2xlLWNoYXJ0cy9kaXN0L2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vc3JjL05ld0dhbnR0V2lkZ2V0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuXG4vKipcbiAqIEhvb2sgdG8gbG9hZCBleHRlcm5hbCBzY3JpcHQuXG4gKiBAcGFyYW0gc3JjIC0gU291cmNlIHVybCB0byBsb2FkLlxuICogQHBhcmFtIG9uTG9hZCAtIFN1Y2Nlc3MgY2FsbGJhY2suXG4gKiBAcGFyYW0gb25FcnJvciAtIEVycm9yIGNhbGxiYWNrLlxuICovIGZ1bmN0aW9uIHVzZUxvYWRTY3JpcHQoc3JjLCBvbkxvYWQsIG9uRXJyb3IpIHtcbiAgICB1c2VFZmZlY3QoKCk9PntcbiAgICAgICAgaWYgKCFkb2N1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZpbmQgc2NyaXB0IHRhZyB3aXRoIHNhbWUgc3JjIGluIERPTS5cbiAgICAgICAgY29uc3QgZm91bmRTY3JpcHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzY3JpcHRbc3JjPVwiJy5jb25jYXQoc3JjLCAnXCJdJykpO1xuICAgICAgICAvLyBDYWxsIG9uTG9hZCBpZiBzY3JpcHQgbWFya2VkIGFzIGxvYWRlZC5cbiAgICAgICAgaWYgKGZvdW5kU2NyaXB0ID09PSBudWxsIHx8IGZvdW5kU2NyaXB0ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBmb3VuZFNjcmlwdC5kYXRhc2V0LmxvYWRlZCkge1xuICAgICAgICAgICAgb25Mb2FkID09PSBudWxsIHx8IG9uTG9hZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25Mb2FkKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ3JlYXRlIG9yIGdldCBleGlzdGVkIHRhZy5cbiAgICAgICAgY29uc3Qgc2NyaXB0ID0gZm91bmRTY3JpcHQgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgLy8gU2V0IHNyYyBpZiBubyBzY3JpcHQgd2FzIGZvdW5kLlxuICAgICAgICBpZiAoIWZvdW5kU2NyaXB0KSB7XG4gICAgICAgICAgICBzY3JpcHQuc3JjID0gc3JjO1xuICAgICAgICB9XG4gICAgICAgIC8vIE1hcmsgc2NyaXB0IGFzIGxvYWRlZCBvbiBsb2FkIGV2ZW50LlxuICAgICAgICBjb25zdCBvbkxvYWRXaXRoTWFya2VyID0gKCk9PntcbiAgICAgICAgICAgIHNjcmlwdC5kYXRhc2V0LmxvYWRlZCA9IFwiMVwiO1xuICAgICAgICAgICAgb25Mb2FkID09PSBudWxsIHx8IG9uTG9hZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25Mb2FkKCk7XG4gICAgICAgIH07XG4gICAgICAgIHNjcmlwdC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBvbkxvYWRXaXRoTWFya2VyKTtcbiAgICAgICAgaWYgKG9uRXJyb3IpIHtcbiAgICAgICAgICAgIHNjcmlwdC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgb25FcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIHRvIERPTSBpZiBub3QgeWV0IGFkZGVkLlxuICAgICAgICBpZiAoIWZvdW5kU2NyaXB0KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZChzY3JpcHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgc2NyaXB0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIG9uTG9hZFdpdGhNYXJrZXIpO1xuICAgICAgICAgICAgaWYgKG9uRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBzY3JpcHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIG9uRXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sIFtdKTtcbn1cblxuLyoqXG4gKiBIb29rIHRvIGxvYWQgR29vZ2xlIENoYXJ0cyBKUyBBUEkuXG4gKiBAcGFyYW0gcGFyYW1zIC0gTG9hZCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIFtwYXJhbXMuY2hhcnRWZXJzaW9uXSAtIENoYXJ0IHZlcnNpb24gdG8gbG9hZC5cbiAqIEBwYXJhbSBbcGFyYW1zLmNoYXJ0UGFja2FnZXNdIC0gUGFja2FnZXMgdG8gbG9hZC5cbiAqIEBwYXJhbSBbcGFyYW1zLmNoYXJ0TGFuZ3VhZ2VdIC0gTGFuZ3VhZ2VzIHRvIGxvYWQuXG4gKiBAcGFyYW0gW3BhcmFtcy5tYXBzQXBpS2V5XSAtIEdvb2dsZSBNYXBzIGFwaSBrZXkuXG4gKiBAcmV0dXJuc1xuICovIGZ1bmN0aW9uIHVzZUxvYWRHb29nbGVDaGFydHMocGFyYW0pIHtcbiAgICBsZXQgeyBjaGFydFZlcnNpb24gPVwiY3VycmVudFwiICwgY2hhcnRQYWNrYWdlcyA9W1xuICAgICAgICBcImNvcmVjaGFydFwiLFxuICAgICAgICBcImNvbnRyb2xzXCJcbiAgICBdICwgY2hhcnRMYW5ndWFnZSA9XCJlblwiICwgbWFwc0FwaUtleSAgfSA9IHBhcmFtO1xuICAgIGNvbnN0IFtnb29nbGVDaGFydHMsIHNldEdvb2dsZUNoYXJ0c10gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbZmFpbGVkLCBzZXRGYWlsZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIHVzZUxvYWRTY3JpcHQoXCJodHRwczovL3d3dy5nc3RhdGljLmNvbS9jaGFydHMvbG9hZGVyLmpzXCIsICgpPT57XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgR2V0dGluZyBvYmplY3QgZnJvbSBnbG9iYWwgbmFtZXNwYWNlLlxuICAgICAgICBjb25zdCBnb29nbGUgPSB3aW5kb3cgPT09IG51bGwgfHwgd2luZG93ID09PSB2b2lkIDAgPyB2b2lkIDAgOiB3aW5kb3cuZ29vZ2xlO1xuICAgICAgICBpZiAoIWdvb2dsZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGdvb2dsZS5jaGFydHMubG9hZChjaGFydFZlcnNpb24sIHtcbiAgICAgICAgICAgIHBhY2thZ2VzOiBjaGFydFBhY2thZ2VzLFxuICAgICAgICAgICAgbGFuZ3VhZ2U6IGNoYXJ0TGFuZ3VhZ2UsXG4gICAgICAgICAgICBtYXBzQXBpS2V5XG4gICAgICAgIH0pO1xuICAgICAgICBnb29nbGUuY2hhcnRzLnNldE9uTG9hZENhbGxiYWNrKCgpPT57XG4gICAgICAgICAgICBzZXRHb29nbGVDaGFydHMoZ29vZ2xlKTtcbiAgICAgICAgfSk7XG4gICAgfSwgKCk9PntcbiAgICAgICAgc2V0RmFpbGVkKHRydWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBbXG4gICAgICAgIGdvb2dsZUNoYXJ0cyxcbiAgICAgICAgZmFpbGVkXG4gICAgXTtcbn1cbi8qKlxuICogV3JhcHBlciBhcm91bmQgdXNlTG9hZEdvb2dsZUNoYXJ0cyB0byB1c2UgaW4gbGVnYWN5IGNvbXBvbmVudHMuXG4gKi8gZnVuY3Rpb24gTG9hZEdvb2dsZUNoYXJ0cyhwYXJhbSkge1xuICAgIGxldCB7IG9uTG9hZCAsIG9uRXJyb3IgLCAuLi5wYXJhbXMgfSA9IHBhcmFtO1xuICAgIGNvbnN0IFtnb29nbGVDaGFydHMsIGZhaWxlZF0gPSB1c2VMb2FkR29vZ2xlQ2hhcnRzKHBhcmFtcyk7XG4gICAgdXNlRWZmZWN0KCgpPT57XG4gICAgICAgIGlmIChnb29nbGVDaGFydHMgJiYgb25Mb2FkKSB7XG4gICAgICAgICAgICBvbkxvYWQoZ29vZ2xlQ2hhcnRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtcbiAgICAgICAgZ29vZ2xlQ2hhcnRzXG4gICAgXSk7XG4gICAgdXNlRWZmZWN0KCgpPT57XG4gICAgICAgIGlmIChmYWlsZWQgJiYgb25FcnJvcikge1xuICAgICAgICAgICAgb25FcnJvcigpO1xuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICBmYWlsZWRcbiAgICBdKTtcbiAgICByZXR1cm4gbnVsbDtcbn1cblxuY29uc3QgY2hhcnREZWZhdWx0UHJvcHMgPSB7XG4gICAgLy8gPERFUFJFQ0FURURfUFJPUFM+XG4gICAgbGVnZW5kX3RvZ2dsZTogZmFsc2UsXG4gICAgLy8gPC9ERVBSRUNBVEVEX1BST1BTPlxuICAgIG9wdGlvbnM6IHt9LFxuICAgIGxlZ2VuZFRvZ2dsZTogZmFsc2UsXG4gICAgZ2V0Q2hhcnRXcmFwcGVyOiAoKT0+e30sXG4gICAgc3ByZWFkU2hlZXRRdWVyeVBhcmFtZXRlcnM6IHtcbiAgICAgICAgaGVhZGVyczogMSxcbiAgICAgICAgZ2lkOiAxXG4gICAgfSxcbiAgICByb290UHJvcHM6IHt9LFxuICAgIGNoYXJ0V3JhcHBlclBhcmFtczoge31cbn07XG5cbmxldCB1bmlxdWVJRCA9IDA7XG5jb25zdCBnZW5lcmF0ZVVuaXF1ZUlEID0gKCk9PntcbiAgICB1bmlxdWVJRCArPSAxO1xuICAgIHJldHVybiBcInJlYWN0Z29vZ2xlZ3JhcGgtXCIuY29uY2F0KHVuaXF1ZUlEKTtcbn07XG5cbmNvbnN0IERFRkFVTFRfQ0hBUlRfQ09MT1JTID0gW1xuICAgIFwiIzMzNjZDQ1wiLFxuICAgIFwiI0RDMzkxMlwiLFxuICAgIFwiI0ZGOTkwMFwiLFxuICAgIFwiIzEwOTYxOFwiLFxuICAgIFwiIzk5MDA5OVwiLFxuICAgIFwiIzNCM0VBQ1wiLFxuICAgIFwiIzAwOTlDNlwiLFxuICAgIFwiI0RENDQ3N1wiLFxuICAgIFwiIzY2QUEwMFwiLFxuICAgIFwiI0I4MkUyRVwiLFxuICAgIFwiIzMxNjM5NVwiLFxuICAgIFwiIzk5NDQ5OVwiLFxuICAgIFwiIzIyQUE5OVwiLFxuICAgIFwiI0FBQUExMVwiLFxuICAgIFwiIzY2MzNDQ1wiLFxuICAgIFwiI0U2NzMwMFwiLFxuICAgIFwiIzhCMDcwN1wiLFxuICAgIFwiIzMyOTI2MlwiLFxuICAgIFwiIzU1NzRBNlwiLFxuICAgIFwiIzNCM0VBQ1wiXG5dO1xuXG5jb25zdCBsb2FkRGF0YVRhYmxlRnJvbVNwcmVhZFNoZWV0ID0gYXN5bmMgZnVuY3Rpb24oZ29vZ2xlVml6LCBzcHJlYWRTaGVldFVybCkge1xuICAgIGxldCB1cmxQYXJhbXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gXCJcIi5jb25jYXQodXJsUGFyYW1zLmhlYWRlcnMgPyBcImhlYWRlcnM9XCIuY29uY2F0KHVybFBhcmFtcy5oZWFkZXJzKSA6IFwiaGVhZGVycz0wXCIpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IFwiXCIuY29uY2F0KHVybFBhcmFtcy5xdWVyeSA/IFwiJnRxPVwiLmNvbmNhdChlbmNvZGVVUklDb21wb25lbnQodXJsUGFyYW1zLnF1ZXJ5KSkgOiBcIlwiKTtcbiAgICAgICAgY29uc3QgZ2lkID0gXCJcIi5jb25jYXQodXJsUGFyYW1zLmdpZCA/IFwiJmdpZD1cIi5jb25jYXQodXJsUGFyYW1zLmdpZCkgOiBcIlwiKTtcbiAgICAgICAgY29uc3Qgc2hlZXQgPSBcIlwiLmNvbmNhdCh1cmxQYXJhbXMuc2hlZXQgPyBcIiZzaGVldD1cIi5jb25jYXQodXJsUGFyYW1zLnNoZWV0KSA6IFwiXCIpO1xuICAgICAgICBjb25zdCBhY2Nlc3NfdG9rZW4gPSBcIlwiLmNvbmNhdCh1cmxQYXJhbXMuYWNjZXNzX3Rva2VuID8gXCImYWNjZXNzX3Rva2VuPVwiLmNvbmNhdCh1cmxQYXJhbXMuYWNjZXNzX3Rva2VuKSA6IFwiXCIpO1xuICAgICAgICBjb25zdCB1cmxRdWVyeVN0cmluZyA9IFwiXCIuY29uY2F0KGhlYWRlcnMpLmNvbmNhdChnaWQpLmNvbmNhdChzaGVldCkuY29uY2F0KHF1ZXJ5U3RyaW5nKS5jb25jYXQoYWNjZXNzX3Rva2VuKTtcbiAgICAgICAgY29uc3QgdXJsVG9TcHJlYWRTaGVldCA9IFwiXCIuY29uY2F0KHNwcmVhZFNoZWV0VXJsLCBcIi9ndml6L3RxP1wiKS5jb25jYXQodXJsUXVlcnlTdHJpbmcpOyAvLyZ0cT0ke3F1ZXJ5U3RyaW5nfWA7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gbmV3IGdvb2dsZVZpei52aXN1YWxpemF0aW9uLlF1ZXJ5KHVybFRvU3ByZWFkU2hlZXQpO1xuICAgICAgICBxdWVyeS5zZW5kKChyZXNwb25zZSk9PntcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5pc0Vycm9yKCkpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoXCJFcnJvciBpbiBxdWVyeTogIFwiLmNvbmNhdChyZXNwb25zZS5nZXRNZXNzYWdlKCksIFwiIFwiKS5jb25jYXQocmVzcG9uc2UuZ2V0RGV0YWlsZWRNZXNzYWdlKCkpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZS5nZXREYXRhVGFibGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuY29uc3QgeyBQcm92aWRlciAsIENvbnN1bWVyICB9ID0gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVDb250ZXh0KGNoYXJ0RGVmYXVsdFByb3BzKTtcbmNvbnN0IENvbnRleHRQcm92aWRlciA9IChwYXJhbSk9PntcbiAgICBsZXQgeyBjaGlsZHJlbiAsIHZhbHVlICB9ID0gcGFyYW07XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChQcm92aWRlciwge1xuICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICB9LCBjaGlsZHJlbik7XG59O1xuY29uc3QgQ29udGV4dENvbnN1bWVyID0gKHBhcmFtKT0+e1xuICAgIGxldCB7IHJlbmRlciAgfSA9IHBhcmFtO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29uc3VtZXIsIG51bGwsIChjb250ZXh0KT0+e1xuICAgICAgICByZXR1cm4gcmVuZGVyKGNvbnRleHQpO1xuICAgIH0pO1xufTtcblxuY29uc3QgR1JBWV9DT0xPUiA9IFwiI0NDQ0NDQ1wiO1xuY2xhc3MgR29vZ2xlQ2hhcnREYXRhVGFibGVJbm5lciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZHJhdyh0aGlzLnByb3BzKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5vblJlc2l6ZSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmxlZ2VuZF90b2dnbGUgfHwgdGhpcy5wcm9wcy5sZWdlbmRUb2dnbGUpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG9MZWdlbmRUb2dnbGUoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgY29uc3QgeyBnb29nbGUgLCBnb29nbGVDaGFydFdyYXBwZXIgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgZ29vZ2xlLnZpc3VhbGl6YXRpb24uZXZlbnRzLnJlbW92ZUFsbExpc3RlbmVycyhnb29nbGVDaGFydFdyYXBwZXIpO1xuICAgICAgICBpZiAoZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldENoYXJ0VHlwZSgpID09PSBcIlRpbWVsaW5lXCIpIHtcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5nZXRDaGFydCgpICYmIGdvb2dsZUNoYXJ0V3JhcHBlci5nZXRDaGFydCgpLmNsZWFyQ2hhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIHRoaXMuZHJhdyh0aGlzLnByb3BzKTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaGlkZGVuQ29sdW1uczogW11cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5saXN0ZW5Ub0xlZ2VuZFRvZ2dsZSA9ICgpPT57XG4gICAgICAgICAgICBjb25zdCB7IGdvb2dsZSAsIGdvb2dsZUNoYXJ0V3JhcHBlciAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMuYWRkTGlzdGVuZXIoZ29vZ2xlQ2hhcnRXcmFwcGVyLCBcInNlbGVjdFwiLCAoKT0+e1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoYXJ0ID0gZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldENoYXJ0KCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gY2hhcnQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YVRhYmxlID0gZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldERhdGFUYWJsZSgpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rpb24ubGVuZ3RoID09PSAwIHx8IC8vIFdlIHdhbnQgdG8gbGlzdGVuIHRvIHdoZW4gYSB3aG9sZSByb3cgaXMgc2VsZWN0ZWQuIFRoaXMgaXMgdGhlIGNhc2Ugb25seSB3aGVuIHJvdyA9PT0gbnVsbFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvblswXS5yb3cgfHwgIWRhdGFUYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbkluZGV4ID0gc2VsZWN0aW9uWzBdLmNvbHVtbjtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JRCA9IHRoaXMuZ2V0Q29sdW1uSUQoZGF0YVRhYmxlLCBjb2x1bW5JbmRleCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGlkZGVuQ29sdW1ucy5pbmNsdWRlcyhjb2x1bW5JRCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSgoc3RhdGUpPT4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZGRlbkNvbHVtbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuaGlkZGVuQ29sdW1ucy5maWx0ZXIoKGNvbElEKT0+Y29sSUQgIT09IGNvbHVtbklEKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoKHN0YXRlKT0+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWRkZW5Db2x1bW5zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmhpZGRlbkNvbHVtbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbklEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFwcGx5Rm9ybWF0dGVycyA9IChkYXRhVGFibGUsIGZvcm1hdHRlcnMpPT57XG4gICAgICAgICAgICBjb25zdCB7IGdvb2dsZSAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBmb3IgKGxldCBmb3JtYXR0ZXIgb2YgZm9ybWF0dGVycyl7XG4gICAgICAgICAgICAgICAgc3dpdGNoKGZvcm1hdHRlci50eXBlKXtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkFycm93Rm9ybWF0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgdml6Rm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkFycm93Rm9ybWF0KGZvcm1hdHRlci5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXpGb3JtYXR0ZXIuZm9ybWF0KGRhdGFUYWJsZSwgZm9ybWF0dGVyLmNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJCYXJGb3JtYXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2aXpGb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQmFyRm9ybWF0KGZvcm1hdHRlci5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXpGb3JtYXR0ZXIuZm9ybWF0KGRhdGFUYWJsZSwgZm9ybWF0dGVyLmNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJDb2xvckZvcm1hdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZpekZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2xvckZvcm1hdChmb3JtYXR0ZXIub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyByYW5nZXMgIH0gPSBmb3JtYXR0ZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcmFuZ2Ugb2YgcmFuZ2VzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdml6Rm9ybWF0dGVyLmFkZFJhbmdlKC4uLnJhbmdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdml6Rm9ybWF0dGVyLmZvcm1hdChkYXRhVGFibGUsIGZvcm1hdHRlci5jb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRGF0ZUZvcm1hdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZpekZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRlRm9ybWF0KGZvcm1hdHRlci5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXpGb3JtYXR0ZXIuZm9ybWF0KGRhdGFUYWJsZSwgZm9ybWF0dGVyLmNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJOdW1iZXJGb3JtYXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2aXpGb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uTnVtYmVyRm9ybWF0KGZvcm1hdHRlci5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXpGb3JtYXR0ZXIuZm9ybWF0KGRhdGFUYWJsZSwgZm9ybWF0dGVyLmNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJQYXR0ZXJuRm9ybWF0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgdml6Rm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBhdHRlcm5Gb3JtYXQoZm9ybWF0dGVyLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpekZvcm1hdHRlci5mb3JtYXQoZGF0YVRhYmxlLCBmb3JtYXR0ZXIuY29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0Q29sdW1uSUQgPSAoZGF0YVRhYmxlLCBjb2x1bW5JbmRleCk9PntcbiAgICAgICAgICAgIHJldHVybiBkYXRhVGFibGUuZ2V0Q29sdW1uSWQoY29sdW1uSW5kZXgpIHx8IGRhdGFUYWJsZS5nZXRDb2x1bW5MYWJlbChjb2x1bW5JbmRleCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZHJhdyA9IGFzeW5jIChwYXJhbSk9PntcbiAgICAgICAgICAgIGxldCB7IGRhdGEgLCBkaWZmZGF0YSAsIHJvd3MgLCBjb2x1bW5zICwgb3B0aW9ucyAsIGxlZ2VuZF90b2dnbGUgLCBsZWdlbmRUb2dnbGUgLCBjaGFydFR5cGUgLCBmb3JtYXR0ZXJzICwgc3ByZWFkU2hlZXRVcmwgLCBzcHJlYWRTaGVldFF1ZXJ5UGFyYW1ldGVycyAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgY29uc3QgeyBnb29nbGUgLCBnb29nbGVDaGFydFdyYXBwZXIgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgbGV0IGRhdGFUYWJsZTtcbiAgICAgICAgICAgIGxldCBjaGFydERpZmYgPSBudWxsO1xuICAgICAgICAgICAgaWYgKGRpZmZkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkRGF0YSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoZGlmZmRhdGEub2xkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdEYXRhID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkaWZmZGF0YS5uZXcpO1xuICAgICAgICAgICAgICAgIGNoYXJ0RGlmZiA9IGdvb2dsZS52aXN1YWxpemF0aW9uW2NoYXJ0VHlwZV0ucHJvdG90eXBlLmNvbXB1dGVEaWZmKG9sZERhdGEsIG5ld0RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhVGFibGUgPSBnb29nbGUudmlzdWFsaXphdGlvbi5hcnJheVRvRGF0YVRhYmxlKGRhdGEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFUYWJsZSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChyb3dzICYmIGNvbHVtbnMpIHtcbiAgICAgICAgICAgICAgICBkYXRhVGFibGUgPSBnb29nbGUudmlzdWFsaXphdGlvbi5hcnJheVRvRGF0YVRhYmxlKFtcbiAgICAgICAgICAgICAgICAgICAgY29sdW1ucyxcbiAgICAgICAgICAgICAgICAgICAgLi4ucm93c1xuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzcHJlYWRTaGVldFVybCkge1xuICAgICAgICAgICAgICAgIGRhdGFUYWJsZSA9IGF3YWl0IGxvYWREYXRhVGFibGVGcm9tU3ByZWFkU2hlZXQoZ29vZ2xlLCBzcHJlYWRTaGVldFVybCwgc3ByZWFkU2hlZXRRdWVyeVBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYXRhVGFibGUgPSBnb29nbGUudmlzdWFsaXphdGlvbi5hcnJheVRvRGF0YVRhYmxlKFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNvbHVtbkNvdW50ID0gZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpO1xuICAgICAgICAgICAgY29uc3Qgdmlld0NvbHVtbnMgPSBBcnJheShjb2x1bW5Db3VudCkuZmlsbCgwKS5tYXAoKGMsIGkpPT57XG4gICAgICAgICAgICAgICAgY29uc3QgY29sdW1uSUQgPSB0aGlzLmdldENvbHVtbklEKGRhdGFUYWJsZSwgaSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGlkZGVuQ29sdW1ucy5pbmNsdWRlcyhjb2x1bW5JRCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBkYXRhVGFibGUuZ2V0Q29sdW1uTGFiZWwoaSksXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBkYXRhVGFibGUuZ2V0Q29sdW1uVHlwZShpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGM6ICgpPT5udWxsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBjaGFydCA9IGdvb2dsZUNoYXJ0V3JhcHBlci5nZXRDaGFydCgpO1xuICAgICAgICAgICAgaWYgKGdvb2dsZUNoYXJ0V3JhcHBlci5nZXRDaGFydFR5cGUoKSA9PT0gXCJUaW1lbGluZVwiKSB7XG4gICAgICAgICAgICAgICAgY2hhcnQgJiYgY2hhcnQuY2xlYXJDaGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldENoYXJ0VHlwZShjaGFydFR5cGUpO1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldE9wdGlvbnMob3B0aW9ucyB8fCB7fSk7XG4gICAgICAgICAgICBjb25zdCB2aWV3VGFibGUgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVZpZXcoZGF0YVRhYmxlKTtcbiAgICAgICAgICAgIHZpZXdUYWJsZS5zZXRDb2x1bW5zKHZpZXdDb2x1bW5zKTtcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5zZXREYXRhVGFibGUodmlld1RhYmxlKTtcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5kcmF3KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5nb29nbGVDaGFydERhc2hib2FyZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ29vZ2xlQ2hhcnREYXNoYm9hcmQuZHJhdyhkYXRhVGFibGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNoYXJ0RGlmZikge1xuICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5zZXREYXRhVGFibGUoY2hhcnREaWZmKTtcbiAgICAgICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuZHJhdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZvcm1hdHRlcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGx5Rm9ybWF0dGVycyhkYXRhVGFibGUsIGZvcm1hdHRlcnMpO1xuICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5zZXREYXRhVGFibGUoZGF0YVRhYmxlKTtcbiAgICAgICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuZHJhdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxlZ2VuZFRvZ2dsZSA9PT0gdHJ1ZSB8fCBsZWdlbmRfdG9nZ2xlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmF5T3V0SGlkZGVuQ29sdW1ucyh7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5ncmF5T3V0SGlkZGVuQ29sdW1ucyA9IChwYXJhbSk9PntcbiAgICAgICAgICAgIGxldCB7IG9wdGlvbnMgIH0gPSBwYXJhbTtcbiAgICAgICAgICAgIGNvbnN0IHsgZ29vZ2xlQ2hhcnRXcmFwcGVyICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IGRhdGFUYWJsZSA9IGdvb2dsZUNoYXJ0V3JhcHBlci5nZXREYXRhVGFibGUoKTtcbiAgICAgICAgICAgIGlmICghZGF0YVRhYmxlKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBjb2x1bW5Db3VudCA9IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTtcbiAgICAgICAgICAgIGNvbnN0IGhhc0FIaWRkZW5Db2x1bW4gPSB0aGlzLnN0YXRlLmhpZGRlbkNvbHVtbnMubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIGlmIChoYXNBSGlkZGVuQ29sdW1uID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgY29sb3JzID0gQXJyYXkuZnJvbSh7XG4gICAgICAgICAgICAgICAgbGVuZ3RoOiBjb2x1bW5Db3VudCAtIDFcbiAgICAgICAgICAgIH0pLm1hcCgoZG9udGNhcmUsIGkpPT57XG4gICAgICAgICAgICAgICAgY29uc3QgY29sdW1uSUQgPSB0aGlzLmdldENvbHVtbklEKGRhdGFUYWJsZSwgaSArIDEpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmhpZGRlbkNvbHVtbnMuaW5jbHVkZXMoY29sdW1uSUQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBHUkFZX0NPTE9SO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmNvbG9ycykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5jb2xvcnNbaV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERFRkFVTFRfQ0hBUlRfQ09MT1JTW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgY29sb3JzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5kcmF3KCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25SZXNpemUgPSAoKT0+e1xuICAgICAgICAgICAgY29uc3QgeyBnb29nbGVDaGFydFdyYXBwZXIgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLmRyYXcoKTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5jbGFzcyBHb29nbGVDaGFydERhdGFUYWJsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7fVxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge31cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7IGdvb2dsZSAsIGdvb2dsZUNoYXJ0V3JhcHBlciAsIGdvb2dsZUNoYXJ0RGFzaGJvYXJkICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChDb250ZXh0Q29uc3VtZXIsIHtcbiAgICAgICAgICAgIHJlbmRlcjogKHByb3BzKT0+e1xuICAgICAgICAgICAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoR29vZ2xlQ2hhcnREYXRhVGFibGVJbm5lciwgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlOiBnb29nbGUsXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlcjogZ29vZ2xlQ2hhcnRXcmFwcGVyLFxuICAgICAgICAgICAgICAgICAgICBnb29nbGVDaGFydERhc2hib2FyZDogZ29vZ2xlQ2hhcnREYXNoYm9hcmRcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuY2xhc3MgR29vZ2xlQ2hhcnRFdmVudHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBsaXN0ZW5Ub0V2ZW50cyhwYXJhbSkge1xuICAgICAgICBsZXQgeyBjaGFydEV2ZW50cyAsIGdvb2dsZSAsIGdvb2dsZUNoYXJ0V3JhcHBlciAgfSA9IHBhcmFtO1xuICAgICAgICBpZiAoIWNoYXJ0RXZlbnRzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZ29vZ2xlLnZpc3VhbGl6YXRpb24uZXZlbnRzLnJlbW92ZUFsbExpc3RlbmVycyhnb29nbGVDaGFydFdyYXBwZXIpO1xuICAgICAgICBmb3IgKGxldCBldmVudCBvZiBjaGFydEV2ZW50cyl7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgY29uc3QgeyBldmVudE5hbWUgLCBjYWxsYmFjayAgfSA9IGV2ZW50O1xuICAgICAgICAgICAgZ29vZ2xlLnZpc3VhbGl6YXRpb24uZXZlbnRzLmFkZExpc3RlbmVyKGdvb2dsZUNoYXJ0V3JhcHBlciwgZXZlbnROYW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHtcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRXcmFwcGVyOiBnb29nbGVDaGFydFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgICAgIHByb3BzOiBfdGhpcy5wcm9wcyxcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlOiBnb29nbGUsXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QXJnczogYXJnc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHZhciByZWY7XG4gICAgICAgIGNvbnN0IHsgZ29vZ2xlICwgZ29vZ2xlQ2hhcnRXcmFwcGVyICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgdGhpcy5saXN0ZW5Ub0V2ZW50cyh7XG4gICAgICAgICAgICBjaGFydEV2ZW50czogKChyZWYgPSB0aGlzLnByb3BzRnJvbUNvbnRleHQpID09PSBudWxsIHx8IHJlZiA9PT0gdm9pZCAwID8gdm9pZCAwIDogcmVmLmNoYXJ0RXZlbnRzKSB8fCBudWxsLFxuICAgICAgICAgICAgZ29vZ2xlLFxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMucHJvcHM7XG4gICAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29udGV4dENvbnN1bWVyLCB7XG4gICAgICAgICAgICByZW5kZXI6IChwcm9wc0Zyb21Db250ZXh0KT0+e1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHNGcm9tQ29udGV4dCA9IHByb3BzRnJvbUNvbnRleHQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyl7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5wcm9wc0Zyb21Db250ZXh0ID0gbnVsbDtcbiAgICB9XG59XG5cbmxldCBjb250cm9sQ291bnRlciA9IDA7XG5jbGFzcyBHb29nbGVDaGFydCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHsgb3B0aW9ucyAsIGdvb2dsZSAsIGNoYXJ0VHlwZSAsIGNoYXJ0V3JhcHBlclBhcmFtcyAsIHRvb2xiYXJJdGVtcyAsIGdldENoYXJ0RWRpdG9yICwgZ2V0Q2hhcnRXcmFwcGVyICwgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCBjaGFydENvbmZpZyA9IHtcbiAgICAgICAgICAgIGNoYXJ0VHlwZSxcbiAgICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICBjb250YWluZXJJZDogdGhpcy5nZXRHcmFwaElEKCksXG4gICAgICAgICAgICAuLi5jaGFydFdyYXBwZXJQYXJhbXNcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZ29vZ2xlQ2hhcnRXcmFwcGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNoYXJ0V3JhcHBlcihjaGFydENvbmZpZyk7XG4gICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5zZXRPcHRpb25zKG9wdGlvbnMgfHwge30pO1xuICAgICAgICBpZiAoZ2V0Q2hhcnRXcmFwcGVyKSB7XG4gICAgICAgICAgICBnZXRDaGFydFdyYXBwZXIoZ29vZ2xlQ2hhcnRXcmFwcGVyLCBnb29nbGUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGdvb2dsZUNoYXJ0RGFzaGJvYXJkID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhc2hib2FyZCh0aGlzLmRhc2hib2FyZF9yZWYpO1xuICAgICAgICBjb25zdCBnb29nbGVDaGFydENvbnRyb2xzID0gdGhpcy5hZGRDb250cm9scyhnb29nbGVDaGFydFdyYXBwZXIsIGdvb2dsZUNoYXJ0RGFzaGJvYXJkKTtcbiAgICAgICAgaWYgKHRvb2xiYXJJdGVtcykge1xuICAgICAgICAgICAgZ29vZ2xlLnZpc3VhbGl6YXRpb24uZHJhd1Rvb2xiYXIodGhpcy50b29sYmFyX3JlZi5jdXJyZW50LCB0b29sYmFySXRlbXMpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBnb29nbGVDaGFydEVkaXRvciA9IG51bGw7XG4gICAgICAgIGlmIChnZXRDaGFydEVkaXRvcikge1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRFZGl0b3IgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ2hhcnRFZGl0b3IoKTtcbiAgICAgICAgICAgIGdldENoYXJ0RWRpdG9yKHtcbiAgICAgICAgICAgICAgICBjaGFydEVkaXRvcjogZ29vZ2xlQ2hhcnRFZGl0b3IsXG4gICAgICAgICAgICAgICAgY2hhcnRXcmFwcGVyOiBnb29nbGVDaGFydFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgZ29vZ2xlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0RWRpdG9yLFxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRDb250cm9sczogZ29vZ2xlQ2hhcnRDb250cm9scyxcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0RGFzaGJvYXJkOiBnb29nbGVDaGFydERhc2hib2FyZCxcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlcixcbiAgICAgICAgICAgIGlzUmVhZHk6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmdvb2dsZUNoYXJ0V3JhcHBlcikgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnREYXNoYm9hcmQpIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmdvb2dsZUNoYXJ0Q29udHJvbHMpIHJldHVybjtcbiAgICAgICAgY29uc3QgeyBjb250cm9scyAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmIChjb250cm9scykge1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGNvbnRyb2xzLmxlbmd0aDsgaSArPSAxKXtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGNvbnRyb2xUeXBlICwgb3B0aW9ucyAsIGNvbnRyb2xXcmFwcGVyUGFyYW1zICB9ID0gY29udHJvbHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRyb2xXcmFwcGVyUGFyYW1zICYmIFwic3RhdGVcIiBpbiBjb250cm9sV3JhcHBlclBhcmFtcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmdvb2dsZUNoYXJ0Q29udHJvbHNbaV0uY29udHJvbC5zZXRTdGF0ZShjb250cm9sV3JhcHBlclBhcmFtc1tcInN0YXRlXCJdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5nb29nbGVDaGFydENvbnRyb2xzW2ldLmNvbnRyb2wuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmdvb2dsZUNoYXJ0Q29udHJvbHNbaV0uY29udHJvbC5zZXRDb250cm9sVHlwZShjb250cm9sVHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmlzUmVhZHkgIT09IG5leHRTdGF0ZS5pc1JlYWR5IHx8IG5leHRQcm9wcy5jb250cm9scyAhPT0gdGhpcy5wcm9wcy5jb250cm9scztcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7IHdpZHRoICwgaGVpZ2h0ICwgb3B0aW9ucyAsIHN0eWxlICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgZGl2U3R5bGUgPSB7XG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCB8fCBvcHRpb25zICYmIG9wdGlvbnMuaGVpZ2h0LFxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoIHx8IG9wdGlvbnMgJiYgb3B0aW9ucy53aWR0aCxcbiAgICAgICAgICAgIC4uLnN0eWxlXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJlbmRlcikge1xuICAgICAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICAgICAgICAgICAgcmVmOiB0aGlzLmRhc2hib2FyZF9yZWYsXG4gICAgICAgICAgICAgICAgc3R5bGU6IGRpdlN0eWxlXG4gICAgICAgICAgICB9LCAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgICAgICAgICAgIHJlZjogdGhpcy50b29sYmFyX3JlZixcbiAgICAgICAgICAgICAgICBpZDogXCJ0b29sYmFyXCJcbiAgICAgICAgICAgIH0pLCB0aGlzLnByb3BzLnJlbmRlcih7XG4gICAgICAgICAgICAgICAgcmVuZGVyQ2hhcnQ6IHRoaXMucmVuZGVyQ2hhcnQsXG4gICAgICAgICAgICAgICAgcmVuZGVyQ29udHJvbDogdGhpcy5yZW5kZXJDb250cm9sLFxuICAgICAgICAgICAgICAgIHJlbmRlclRvb2xiYXI6IHRoaXMucmVuZGVyVG9vbEJhclxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICAgICAgICAgICAgcmVmOiB0aGlzLmRhc2hib2FyZF9yZWYsXG4gICAgICAgICAgICAgICAgc3R5bGU6IGRpdlN0eWxlXG4gICAgICAgICAgICB9LCB0aGlzLnJlbmRlckNvbnRyb2woKHBhcmFtKT0+e1xuICAgICAgICAgICAgICAgIGxldCB7IGNvbnRyb2xQcm9wICB9ID0gcGFyYW07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRyb2xQcm9wLmNvbnRyb2xQb3NpdGlvbiAhPT0gXCJib3R0b21cIjtcbiAgICAgICAgICAgIH0pLCB0aGlzLnJlbmRlckNoYXJ0KCksIHRoaXMucmVuZGVyQ29udHJvbCgocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgbGV0IHsgY29udHJvbFByb3AgIH0gPSBwYXJhbTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbFByb3AuY29udHJvbFBvc2l0aW9uID09PSBcImJvdHRvbVwiO1xuICAgICAgICAgICAgfSksIHRoaXMucmVuZGVyVG9vbEJhcigpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzMSl7XG4gICAgICAgIHZhciBfdGhpczE7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MxKSwgX3RoaXMxID0gdGhpcztcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlcjogbnVsbCxcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0RGFzaGJvYXJkOiBudWxsLFxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRDb250cm9sczogbnVsbCxcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0RWRpdG9yOiBudWxsLFxuICAgICAgICAgICAgaXNSZWFkeTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5ncmFwaElEID0gbnVsbDtcbiAgICAgICAgdGhpcy5kYXNoYm9hcmRfcmVmID0gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVSZWYoKTtcbiAgICAgICAgdGhpcy50b29sYmFyX3JlZiA9IC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlUmVmKCk7XG4gICAgICAgIHRoaXMuZ2V0R3JhcGhJRCA9ICgpPT57XG4gICAgICAgICAgICBjb25zdCB7IGdyYXBoSUQgLCBncmFwaF9pZCAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBsZXQgaW5zdGFuY2VHcmFwaElEO1xuICAgICAgICAgICAgaWYgKCFncmFwaElEICYmICFncmFwaF9pZCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5ncmFwaElEKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlR3JhcGhJRCA9IGdlbmVyYXRlVW5pcXVlSUQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUdyYXBoSUQgPSB0aGlzLmdyYXBoSUQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChncmFwaElEICYmICFncmFwaF9pZCkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlR3JhcGhJRCA9IGdyYXBoSUQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdyYXBoX2lkICYmICFncmFwaElEKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VHcmFwaElEID0gZ3JhcGhfaWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlR3JhcGhJRCA9IGdyYXBoSUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmdyYXBoSUQgPSBpbnN0YW5jZUdyYXBoSUQ7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ncmFwaElEO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldENvbnRyb2xJRCA9IChpZCwgaW5kZXgpPT57XG4gICAgICAgICAgICBjb250cm9sQ291bnRlciArPSAxO1xuICAgICAgICAgICAgbGV0IGNvbnRyb2xJRDtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICBjb250cm9sSUQgPSBcImdvb2dsZWNoYXJ0LWNvbnRyb2wtXCIuY29uY2F0KGluZGV4LCBcIi1cIikuY29uY2F0KGNvbnRyb2xDb3VudGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udHJvbElEID0gaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29udHJvbElEO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFkZENvbnRyb2xzID0gKGdvb2dsZUNoYXJ0V3JhcHBlciwgZ29vZ2xlQ2hhcnREYXNoYm9hcmQpPT57XG4gICAgICAgICAgICBjb25zdCB7IGdvb2dsZSAsIGNvbnRyb2xzICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IGdvb2dsZUNoYXJ0Q29udHJvbHMgPSAhY29udHJvbHMgPyBudWxsIDogY29udHJvbHMubWFwKChjb250cm9sLCBpKT0+e1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgY29udHJvbElEOiBjb250cm9sSURNYXliZSAsIGNvbnRyb2xUeXBlICwgb3B0aW9uczogY29udHJvbE9wdGlvbnMgLCBjb250cm9sV3JhcHBlclBhcmFtcyAsICB9ID0gY29udHJvbDtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250cm9sSUQgPSB0aGlzLmdldENvbnRyb2xJRChjb250cm9sSURNYXliZSwgaSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbFByb3A6IGNvbnRyb2wsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2w6IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db250cm9sV3JhcHBlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJJZDogY29udHJvbElELFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBjb250cm9sT3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmNvbnRyb2xXcmFwcGVyUGFyYW1zXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFnb29nbGVDaGFydENvbnRyb2xzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnb29nbGVDaGFydERhc2hib2FyZC5iaW5kKGdvb2dsZUNoYXJ0Q29udHJvbHMubWFwKChwYXJhbSk9PntcbiAgICAgICAgICAgICAgICBsZXQgeyBjb250cm9sICB9ID0gcGFyYW07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRyb2w7XG4gICAgICAgICAgICB9KSwgZ29vZ2xlQ2hhcnRXcmFwcGVyKTtcbiAgICAgICAgICAgIGZvciAobGV0IGNoYXJ0Q29udHJvbCBvZiBnb29nbGVDaGFydENvbnRyb2xzKXtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGNvbnRyb2wgLCBjb250cm9sUHJvcCAgfSA9IGNoYXJ0Q29udHJvbDtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGNvbnRyb2xFdmVudHMgPVtdICB9ID0gY29udHJvbFByb3A7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZXZlbnQgb2YgY29udHJvbEV2ZW50cyl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgY2FsbGJhY2sgLCBldmVudE5hbWUgIH0gPSBldmVudDtcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlLnZpc3VhbGl6YXRpb24uZXZlbnRzLnJlbW92ZUxpc3RlbmVyKGNvbnRyb2wsIGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMuYWRkTGlzdGVuZXIoY29udHJvbCwgZXZlbnROYW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0V3JhcHBlcjogZ29vZ2xlQ2hhcnRXcmFwcGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xXcmFwcGVyOiBjb250cm9sLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiBfdGhpcy5wcm9wcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb29nbGU6IGdvb2dsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudEFyZ3M6IGFyZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZ29vZ2xlQ2hhcnRDb250cm9scztcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yZW5kZXJDaGFydCA9ICgpPT57XG4gICAgICAgICAgICBjb25zdCB7IHdpZHRoICwgaGVpZ2h0ICwgb3B0aW9ucyAsIHN0eWxlICwgY2xhc3NOYW1lICwgcm9vdFByb3BzICwgZ29vZ2xlICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IGRpdlN0eWxlID0ge1xuICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0IHx8IG9wdGlvbnMgJiYgb3B0aW9ucy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoIHx8IG9wdGlvbnMgJiYgb3B0aW9ucy53aWR0aCxcbiAgICAgICAgICAgICAgICAuLi5zdHlsZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgaWQ6IHRoaXMuZ2V0R3JhcGhJRCgpLFxuICAgICAgICAgICAgICAgIHN0eWxlOiBkaXZTdHlsZSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGNsYXNzTmFtZVxuICAgICAgICAgICAgfSwgcm9vdFByb3BzKSwgdGhpcy5zdGF0ZS5pc1JlYWR5ICYmIHRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRXcmFwcGVyICE9PSBudWxsID8gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkZyYWdtZW50LCBudWxsLCAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoR29vZ2xlQ2hhcnREYXRhVGFibGUsIHtcbiAgICAgICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXI6IHRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRXcmFwcGVyLFxuICAgICAgICAgICAgICAgIGdvb2dsZTogZ29vZ2xlLFxuICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0RGFzaGJvYXJkOiB0aGlzLnN0YXRlLmdvb2dsZUNoYXJ0RGFzaGJvYXJkXG4gICAgICAgICAgICB9KSwgLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KEdvb2dsZUNoYXJ0RXZlbnRzLCB7XG4gICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyOiB0aGlzLnN0YXRlLmdvb2dsZUNoYXJ0V3JhcHBlcixcbiAgICAgICAgICAgICAgICBnb29nbGU6IGdvb2dsZVxuICAgICAgICAgICAgfSkpIDogbnVsbCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucmVuZGVyQ29udHJvbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IGZpbHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzBdIDogKHBhcmFtKT0+e1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpczEuc3RhdGUuaXNSZWFkeSAmJiBfdGhpczEuc3RhdGUuZ29vZ2xlQ2hhcnRDb250cm9scyAhPT0gbnVsbCA/IC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgX3RoaXMxLnN0YXRlLmdvb2dsZUNoYXJ0Q29udHJvbHMuZmlsdGVyKChwYXJhbSk9PntcbiAgICAgICAgICAgICAgICBsZXQgeyBjb250cm9sUHJvcCAsIGNvbnRyb2wgIH0gPSBwYXJhbTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyKHtcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbCxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbFByb3BcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLm1hcCgocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgbGV0IHsgY29udHJvbCAsIGNvbnRyb2xQcm9wICB9ID0gcGFyYW07XG4gICAgICAgICAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogY29udHJvbC5nZXRDb250YWluZXJJZCgpLFxuICAgICAgICAgICAgICAgICAgICBpZDogY29udHJvbC5nZXRDb250YWluZXJJZCgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KSkgOiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJlbmRlclRvb2xCYXIgPSAoKT0+e1xuICAgICAgICAgICAgaWYgKCF0aGlzLnByb3BzLnRvb2xiYXJJdGVtcykgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgICAgICAgICByZWY6IHRoaXMudG9vbGJhcl9yZWZcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuY2xhc3MgQ2hhcnQkMSBleHRlbmRzIChSZWFjdC5Db21wb25lbnQpIHtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgY2hhcnRMYW5ndWFnZSAsIGNoYXJ0UGFja2FnZXMgLCBjaGFydFZlcnNpb24gLCBtYXBzQXBpS2V5ICwgbG9hZGVyICwgZXJyb3JFbGVtZW50ICwgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KENvbnRleHRQcm92aWRlciwge1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMucHJvcHNcbiAgICAgICAgfSwgdGhpcy5zdGF0ZS5sb2FkaW5nU3RhdHVzID09PSBcInJlYWR5XCIgJiYgdGhpcy5zdGF0ZS5nb29nbGUgIT09IG51bGwgPyAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoR29vZ2xlQ2hhcnQsIE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHtcbiAgICAgICAgICAgIGdvb2dsZTogdGhpcy5zdGF0ZS5nb29nbGVcbiAgICAgICAgfSkpIDogdGhpcy5zdGF0ZS5sb2FkaW5nU3RhdHVzID09PSBcImVycm9yZWRcIiAmJiBlcnJvckVsZW1lbnQgPyBlcnJvckVsZW1lbnQgOiBsb2FkZXIsIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChMb2FkR29vZ2xlQ2hhcnRzLCB7XG4gICAgICAgICAgICBjaGFydExhbmd1YWdlOiBjaGFydExhbmd1YWdlLFxuICAgICAgICAgICAgY2hhcnRQYWNrYWdlczogY2hhcnRQYWNrYWdlcyxcbiAgICAgICAgICAgIGNoYXJ0VmVyc2lvbjogY2hhcnRWZXJzaW9uLFxuICAgICAgICAgICAgbWFwc0FwaUtleTogbWFwc0FwaUtleSxcbiAgICAgICAgICAgIG9uTG9hZDogdGhpcy5vbkxvYWQsXG4gICAgICAgICAgICBvbkVycm9yOiB0aGlzLm9uRXJyb3JcbiAgICAgICAgfSkpO1xuICAgIH1cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5faXNNb3VudGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBpc0Z1bGx5TG9hZGVkKGdvb2dsZSkge1xuICAgICAgICBjb25zdCB7IGNvbnRyb2xzICwgdG9vbGJhckl0ZW1zICwgZ2V0Q2hhcnRFZGl0b3IgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICByZXR1cm4gZ29vZ2xlICYmIGdvb2dsZS52aXN1YWxpemF0aW9uICYmIGdvb2dsZS52aXN1YWxpemF0aW9uLkNoYXJ0V3JhcHBlciAmJiBnb29nbGUudmlzdWFsaXphdGlvbi5EYXNoYm9hcmQgJiYgKCFjb250cm9scyB8fCBnb29nbGUudmlzdWFsaXphdGlvbi5DaGFydFdyYXBwZXIpICYmICghZ2V0Q2hhcnRFZGl0b3IgfHwgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ2hhcnRFZGl0b3IpICYmICghdG9vbGJhckl0ZW1zIHx8IGdvb2dsZS52aXN1YWxpemF0aW9uLmRyYXdUb29sYmFyKTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGxvYWRpbmdTdGF0dXM6IFwibG9hZGluZ1wiLFxuICAgICAgICAgICAgZ29vZ2xlOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25Mb2FkID0gKGdvb2dsZTEpPT57XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkxvYWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uTG9hZChnb29nbGUxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmlzRnVsbHlMb2FkZWQoZ29vZ2xlMSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uU3VjY2Vzcyhnb29nbGUxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSUUxMTogd2luZG93Lmdvb2dsZSBpcyBub3QgZnVsbHkgc2V0LCB3ZSBoYXZlIHRvIHdhaXRcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IHNldEludGVydmFsKCgpPT57XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdvb2dsZSA9IHdpbmRvdy5nb29nbGU7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc01vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChnb29nbGUgJiYgdGhpcy5pc0Z1bGx5TG9hZGVkKGdvb2dsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU3VjY2Vzcyhnb29nbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vblN1Y2Nlc3MgPSAoZ29vZ2xlKT0+e1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZ1N0YXR1czogXCJyZWFkeVwiLFxuICAgICAgICAgICAgICAgIGdvb2dsZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25FcnJvciA9ICgpPT57XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nU3RhdHVzOiBcImVycm9yZWRcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxufVxuQ2hhcnQkMS5kZWZhdWx0UHJvcHMgPSBjaGFydERlZmF1bHRQcm9wcztcblxudmFyIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlO1xuKGZ1bmN0aW9uKEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlKSB7XG4gICAgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGVbXCJhbm5vdGF0aW9uXCJdID0gXCJhbm5vdGF0aW9uXCI7XG4gICAgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGVbXCJhbm5vdGF0aW9uVGV4dFwiXSA9IFwiYW5ub3RhdGlvblRleHRcIjtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcImNlcnRhaW50eVwiXSA9IFwiY2VydGFpbnR5XCI7XG4gICAgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGVbXCJlbXBoYXNpc1wiXSA9IFwiZW1waGFzaXNcIjtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcImludGVydmFsXCJdID0gXCJpbnRlcnZhbFwiO1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1wic2NvcGVcIl0gPSBcInNjb3BlXCI7XG4gICAgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGVbXCJzdHlsZVwiXSA9IFwic3R5bGVcIjtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcInRvb2x0aXBcIl0gPSBcInRvb2x0aXBcIjtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcImRvbWFpblwiXSA9IFwiZG9tYWluXCI7XG59KShHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZSB8fCAoR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGUgPSB7fSkpO1xuXG52YXIgQ2hhcnQgPSBDaGFydCQxO1xuXG5leHBvcnQgeyBDaGFydCQxIGFzIENoYXJ0LCBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZSwgQ2hhcnQgYXMgZGVmYXVsdCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwXG4iLCJpbXBvcnQgeyBSZWFjdEVsZW1lbnQsIGNyZWF0ZUVsZW1lbnQsIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IE9iamVjdEl0ZW0sIEVkaXRhYmxlVmFsdWUgfSBmcm9tICdtZW5kaXgnO1xuaW1wb3J0IENoYXJ0IGZyb20gJ3JlYWN0LWdvb2dsZS1jaGFydHMnO1xuXG5pbXBvcnQgeyBOZXdHYW50dFdpZGdldENvbnRhaW5lclByb3BzIH0gZnJvbSBcIi4uL3R5cGluZ3MvTmV3R2FudHRXaWRnZXRQcm9wc1wiO1xuXG5pbXBvcnQgXCIuL3VpL05ld0dhbnR0V2lkZ2V0LmNzc1wiO1xuXG50eXBlIENoYXJ0RGF0YVR5cGUgPSAoc3RyaW5nIHwgRGF0ZSB8IG51bWJlciB8IG51bGwpW11bXTsgXG5cbmZ1bmN0aW9uIGVuc3VyZURhdGUoZGF0ZVZhbHVlOiBFZGl0YWJsZVZhbHVlPERhdGU+KTogRGF0ZSB8IHN0cmluZyB8IG51bGwge1xuICAgIGlmICghZGF0ZVZhbHVlIHx8IGRhdGVWYWx1ZS5zdGF0dXMgIT09IFwiYXZhaWxhYmxlXCIgfHwgZGF0ZVZhbHVlLnZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShkYXRlVmFsdWUudmFsdWUpO1xuICAgIGlmIChpc05hTihkYXRlLmdldFRpbWUoKSkpIHJldHVybiBudWxsO1xuICAgIFxuICAgIC8vIEZvcm1hdCAxOiBSZXR1cm4gYXMgaXMgKEphdmFTY3JpcHQgRGF0ZSBvYmplY3QpXG4gICAgcmV0dXJuIGRhdGU7XG4gICAgXG4gICAgLy8gRm9ybWF0IDI6IElTTyBzdHJpbmdcbiAgICAvL3JldHVybiBkYXRlLnRvSVNPU3RyaW5nKCk7XG4gICAgXG4gICAgLy8gRm9ybWF0IDM6IFNwZWNpZmljIHN0cmluZyBmb3JtYXRcbiAgICAvL3JldHVybiBgJHtkYXRlLmdldEZ1bGxZZWFyKCl9LSR7U3RyaW5nKGRhdGUuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9LSR7U3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCAnMCcpfSAke1N0cmluZyhkYXRlLmdldEhvdXJzKCkpLnBhZFN0YXJ0KDIsICcwJyl9OiR7U3RyaW5nKGRhdGUuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCAnMCcpfToke1N0cmluZyhkYXRlLmdldFNlY29uZHMoKSkucGFkU3RhcnQoMiwgJzAnKX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTmV3R2FudHRXaWRnZXQoeyBkYXRhU291cmNlLCB0YXNrSWQsIHRhc2tOYW1lLCB0YXNrUmVzb3VyY2UsIHN0YXJ0RGF0ZSwgZW5kRGF0ZSwgdGFza0R1cmF0aW9uLCBwZXJjZW50Q29tcGxldGUsIHRhc2tEZXBlbmRlbmNpZXMsIHJvd0RhcmtDb2xvciwgcm93Tm9ybWFsQ29sb3IsIGZvbnRTaXplLCBmb250VHlwZSwgZm9udENvbG9yLCBnYW50dEhlaWdodCwgc2hvd0NyaXRpY2FsUGF0aCB9OiBOZXdHYW50dFdpZGdldENvbnRhaW5lclByb3BzKTogUmVhY3RFbGVtZW50IHtcblxuICAgIGNvbnN0IFtjaGFydERhdGEsIHNldENoYXJ0RGF0YV0gPSB1c2VTdGF0ZTxDaGFydERhdGFUeXBlPihbXSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm1EYXRhID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGVhZGVyOiBDaGFydERhdGFUeXBlID0gW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdUYXNrIElEJywgXG4gICAgICAgICAgICAgICAgICAnVGFzayBOYW1lJyxcbiAgICAgICAgICAgICAgICAgICdSZXNvdXJjZScsIFxuICAgICAgICAgICAgICAgICAgJ1N0YXJ0IERhdGUnLCBcbiAgICAgICAgICAgICAgICAgICdFbmQgRGF0ZScsIFxuICAgICAgICAgICAgICAgICAgJ0R1cmF0aW9uJywgXG4gICAgICAgICAgICAgICAgICAnUGVyY2VudCBDb21wbGV0ZScsIFxuICAgICAgICAgICAgICAgICAgJ0RlcGVuZGVuY2llcydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICBdO1xuIFxuICAgICAgICAgICAgaWYgKGRhdGFTb3VyY2UgJiYgZGF0YVNvdXJjZS5zdGF0dXMgPT09ICdhdmFpbGFibGUnICYmIGRhdGFTb3VyY2UuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJJdGVtczpcIiwgZGF0YVNvdXJjZS5pdGVtcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGRhdGFTb3VyY2UuaXRlbXMubWFwKChpdGVtOiBPYmplY3RJdGVtKTogKHN0cmluZyB8IERhdGUgfCBudW1iZXIgfCBudWxsKVtdICA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0RhdGEgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrSWQuZ2V0KGl0ZW0pLnZhbHVlPy50b1N0cmluZygpIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrTmFtZS5nZXQoaXRlbSkudmFsdWU/LnRvU3RyaW5nKCkgfHwgXCJVbm5hbWVkIFRhc2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tSZXNvdXJjZS5nZXQoaXRlbSkudmFsdWU/LnRvU3RyaW5nKCkgfHwgXCJVbm5hbWVkIFJlc291cmNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnN1cmVEYXRlKHN0YXJ0RGF0ZS5nZXQoaXRlbSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5zdXJlRGF0ZShlbmREYXRlLmdldChpdGVtKSksXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrRHVyYXRpb24uZ2V0KGl0ZW0pLnZhbHVlPy50b051bWJlcigpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJjZW50Q29tcGxldGUuZ2V0KGl0ZW0pLnZhbHVlPy50b051bWJlcigpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrRGVwZW5kZW5jaWVzLmdldChpdGVtKS52YWx1ZT8udG9TdHJpbmcoKSB8fCBcIlwiXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSb3cgZGF0YTonLCByb3dEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvd0RhdGE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJDaGFydCBkYXRhOiBcIiwgaGVhZGVyLmNvbmNhdChkYXRhKSk7XG4gICAgICAgICAgICAgICAgc2V0Q2hhcnREYXRhKGhlYWRlci5jb25jYXQoZGF0YSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChkYXRhU291cmNlKSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm1EYXRhKCk7XG4gICAgICAgIH1cbiAgICB9LCBbZGF0YVNvdXJjZSwgdGFza0lkLCB0YXNrTmFtZSwgdGFza1Jlc291cmNlLCBzdGFydERhdGUsIGVuZERhdGUsIHRhc2tEdXJhdGlvbiwgcGVyY2VudENvbXBsZXRlLCB0YXNrRGVwZW5kZW5jaWVzXSk7XG5cbiAgICBjb25zdCBnYW50dE9wdGlvbnMgPSB7XG4gICAgICAgIGdhbnR0OiB7XG4gICAgICAgICAgY3JpdGljYWxQYXRoRW5hYmxlZDogc2hvd0NyaXRpY2FsUGF0aCxcbiAgICAgICAgICBpbm5lckdyaWRUcmFjazogeyBmaWxsOiByb3dOb3JtYWxDb2xvciB9LFxuICAgICAgICAgIGlubmVyR3JpZERhcmtUcmFjazogeyBmaWxsOiByb3dEYXJrQ29sb3IgfSxcbiAgICAgICAgICB0aW1lem9uZTogJ0dNVCcsIC8vIG9yIHlvdXIgc3BlY2lmaWMgdGltZXpvbmVcbiAgICAgICAgICBsYWJlbFN0eWxlOiB7XG4gICAgICAgICAgICBmb250TmFtZTogZm9udFR5cGUsXG4gICAgICAgICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICAgICAgICBjb2xvcjogZm9udENvbG9yXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8Q2hhcnRcbiAgICAgICAgICAgIHdpZHRoPXsnMTAwJSd9XG4gICAgICAgICAgICBoZWlnaHQ9e2dhbnR0SGVpZ2h0fVxuICAgICAgICAgICAgY2hhcnRUeXBlPVwiR2FudHRcIlxuICAgICAgICAgICAgbG9hZGVyPXs8ZGl2PkxvYWRpbmcgQ2hhcnQuLi48L2Rpdj59XG4gICAgICAgICAgICBkYXRhPXtjaGFydERhdGF9XG4gICAgICAgICAgICBvcHRpb25zPXtnYW50dE9wdGlvbnN9XG4gICAgICAgIC8+XG4gICAgKTtcbn0iXSwibmFtZXMiOlsidXNlTG9hZFNjcmlwdCIsInNyYyIsIm9uTG9hZCIsIm9uRXJyb3IiLCJ1c2VFZmZlY3QiLCJkb2N1bWVudCIsImZvdW5kU2NyaXB0IiwicXVlcnlTZWxlY3RvciIsImNvbmNhdCIsImRhdGFzZXQiLCJsb2FkZWQiLCJzY3JpcHQiLCJjcmVhdGVFbGVtZW50Iiwib25Mb2FkV2l0aE1hcmtlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJoZWFkIiwiYXBwZW5kIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7Ozs7O0FBTU8sU0FB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
