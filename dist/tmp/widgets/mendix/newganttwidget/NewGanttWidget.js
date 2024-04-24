define(['exports', 'react'], (function (exports, React) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var React__namespace = /*#__PURE__*/_interopNamespace(React);

    /**
     * Hook to load external script.
     * @param src - Source url to load.
     * @param onLoad - Success callback.
     * @param onError - Error callback.
     */
    function useLoadScript(src, onLoad, onError) {
      React.useEffect(() => {
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
      const [googleCharts, setGoogleCharts] = React.useState(null);
      const [failed, setFailed] = React.useState(false);
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
      React.useEffect(() => {
        if (googleCharts && onLoad) {
          onLoad(googleCharts);
        }
      }, [googleCharts]);
      React.useEffect(() => {
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
    } = /*#__PURE__*/React__namespace.createContext(chartDefaultProps);
    const ContextProvider = param => {
      let {
        children,
        value
      } = param;
      return /*#__PURE__*/React__namespace.createElement(Provider, {
        value: value
      }, children);
    };
    const ContextConsumer = param => {
      let {
        render
      } = param;
      return /*#__PURE__*/React__namespace.createElement(Consumer, null, context => {
        return render(context);
      });
    };
    const GRAY_COLOR = "#CCCCCC";
    class GoogleChartDataTableInner extends React__namespace.Component {
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
    class GoogleChartDataTable extends React__namespace.Component {
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
        return /*#__PURE__*/React__namespace.createElement(ContextConsumer, {
          render: props => {
            return /*#__PURE__*/React__namespace.createElement(GoogleChartDataTableInner, Object.assign({}, props, {
              google: google,
              googleChartWrapper: googleChartWrapper,
              googleChartDashboard: googleChartDashboard
            }));
          }
        });
      }
    }
    class GoogleChartEvents extends React__namespace.Component {
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
        return /*#__PURE__*/React__namespace.createElement(ContextConsumer, {
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
    class GoogleChart extends React__namespace.Component {
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
          return /*#__PURE__*/React__namespace.createElement("div", {
            ref: this.dashboard_ref,
            style: divStyle
          }, /*#__PURE__*/React__namespace.createElement("div", {
            ref: this.toolbar_ref,
            id: "toolbar"
          }), this.props.render({
            renderChart: this.renderChart,
            renderControl: this.renderControl,
            renderToolbar: this.renderToolBar
          }));
        } else {
          return /*#__PURE__*/React__namespace.createElement("div", {
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
        this.dashboard_ref = /*#__PURE__*/React__namespace.createRef();
        this.toolbar_ref = /*#__PURE__*/React__namespace.createRef();
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
          return /*#__PURE__*/React__namespace.createElement("div", Object.assign({
            id: this.getGraphID(),
            style: divStyle,
            className: className
          }, rootProps), this.state.isReady && this.state.googleChartWrapper !== null ? /*#__PURE__*/React__namespace.createElement(React__namespace.Fragment, null, /*#__PURE__*/React__namespace.createElement(GoogleChartDataTable, {
            googleChartWrapper: this.state.googleChartWrapper,
            google: google,
            googleChartDashboard: this.state.googleChartDashboard
          }), /*#__PURE__*/React__namespace.createElement(GoogleChartEvents, {
            googleChartWrapper: this.state.googleChartWrapper,
            google: google
          })) : null);
        };
        this.renderControl = function () {
          let filter = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : param => {
            return true;
          };
          return _this1.state.isReady && _this1.state.googleChartControls !== null ? /*#__PURE__*/React__namespace.createElement(React__namespace.Fragment, null, _this1.state.googleChartControls.filter(param => {
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
            return /*#__PURE__*/React__namespace.createElement("div", {
              key: control.getContainerId(),
              id: control.getContainerId()
            });
          })) : null;
        };
        this.renderToolBar = () => {
          if (!this.props.toolbarItems) return null;
          return /*#__PURE__*/React__namespace.createElement("div", {
            ref: this.toolbar_ref
          });
        };
      }
    }
    class Chart$1 extends React__namespace.Component {
      render() {
        const {
          chartLanguage,
          chartPackages,
          chartVersion,
          mapsApiKey,
          loader,
          errorElement
        } = this.props;
        return /*#__PURE__*/React__namespace.createElement(ContextProvider, {
          value: this.props
        }, this.state.loadingStatus === "ready" && this.state.google !== null ? /*#__PURE__*/React__namespace.createElement(GoogleChart, Object.assign({}, this.props, {
          google: this.state.google
        })) : this.state.loadingStatus === "errored" && errorElement ? errorElement : loader, /*#__PURE__*/React__namespace.createElement(LoadGoogleCharts, {
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
        const [chartData, setChartData] = React.useState([]);
        React.useEffect(() => {
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
        return (React.createElement(Chart, { width: '100%', height: ganttHeight, chartType: "Gantt", loader: React.createElement("div", null, "Loading Chart..."), data: chartData, options: ganttOptions }));
    }

    exports.NewGanttWidget = NewGanttWidget;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV3R2FudHRXaWRnZXQuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9yZWFjdC1nb29nbGUtY2hhcnRzL2Rpc3QvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9zcmMvTmV3R2FudHRXaWRnZXQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5cbi8qKlxuICogSG9vayB0byBsb2FkIGV4dGVybmFsIHNjcmlwdC5cbiAqIEBwYXJhbSBzcmMgLSBTb3VyY2UgdXJsIHRvIGxvYWQuXG4gKiBAcGFyYW0gb25Mb2FkIC0gU3VjY2VzcyBjYWxsYmFjay5cbiAqIEBwYXJhbSBvbkVycm9yIC0gRXJyb3IgY2FsbGJhY2suXG4gKi8gZnVuY3Rpb24gdXNlTG9hZFNjcmlwdChzcmMsIG9uTG9hZCwgb25FcnJvcikge1xuICAgIHVzZUVmZmVjdCgoKT0+e1xuICAgICAgICBpZiAoIWRvY3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gRmluZCBzY3JpcHQgdGFnIHdpdGggc2FtZSBzcmMgaW4gRE9NLlxuICAgICAgICBjb25zdCBmb3VuZFNjcmlwdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NjcmlwdFtzcmM9XCInLmNvbmNhdChzcmMsICdcIl0nKSk7XG4gICAgICAgIC8vIENhbGwgb25Mb2FkIGlmIHNjcmlwdCBtYXJrZWQgYXMgbG9hZGVkLlxuICAgICAgICBpZiAoZm91bmRTY3JpcHQgPT09IG51bGwgfHwgZm91bmRTY3JpcHQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGZvdW5kU2NyaXB0LmRhdGFzZXQubG9hZGVkKSB7XG4gICAgICAgICAgICBvbkxvYWQgPT09IG51bGwgfHwgb25Mb2FkID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvbkxvYWQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBDcmVhdGUgb3IgZ2V0IGV4aXN0ZWQgdGFnLlxuICAgICAgICBjb25zdCBzY3JpcHQgPSBmb3VuZFNjcmlwdCB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgICAgICAvLyBTZXQgc3JjIGlmIG5vIHNjcmlwdCB3YXMgZm91bmQuXG4gICAgICAgIGlmICghZm91bmRTY3JpcHQpIHtcbiAgICAgICAgICAgIHNjcmlwdC5zcmMgPSBzcmM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWFyayBzY3JpcHQgYXMgbG9hZGVkIG9uIGxvYWQgZXZlbnQuXG4gICAgICAgIGNvbnN0IG9uTG9hZFdpdGhNYXJrZXIgPSAoKT0+e1xuICAgICAgICAgICAgc2NyaXB0LmRhdGFzZXQubG9hZGVkID0gXCIxXCI7XG4gICAgICAgICAgICBvbkxvYWQgPT09IG51bGwgfHwgb25Mb2FkID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvbkxvYWQoKTtcbiAgICAgICAgfTtcbiAgICAgICAgc2NyaXB0LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIG9uTG9hZFdpdGhNYXJrZXIpO1xuICAgICAgICBpZiAob25FcnJvcikge1xuICAgICAgICAgICAgc2NyaXB0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBvbkVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgdG8gRE9NIGlmIG5vdCB5ZXQgYWRkZWQuXG4gICAgICAgIGlmICghZm91bmRTY3JpcHQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kKHNjcmlwdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgpPT57XG4gICAgICAgICAgICBzY3JpcHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgb25Mb2FkV2l0aE1hcmtlcik7XG4gICAgICAgICAgICBpZiAob25FcnJvcikge1xuICAgICAgICAgICAgICAgIHNjcmlwdC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgb25FcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSwgW10pO1xufVxuXG4vKipcbiAqIEhvb2sgdG8gbG9hZCBHb29nbGUgQ2hhcnRzIEpTIEFQSS5cbiAqIEBwYXJhbSBwYXJhbXMgLSBMb2FkIHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0gW3BhcmFtcy5jaGFydFZlcnNpb25dIC0gQ2hhcnQgdmVyc2lvbiB0byBsb2FkLlxuICogQHBhcmFtIFtwYXJhbXMuY2hhcnRQYWNrYWdlc10gLSBQYWNrYWdlcyB0byBsb2FkLlxuICogQHBhcmFtIFtwYXJhbXMuY2hhcnRMYW5ndWFnZV0gLSBMYW5ndWFnZXMgdG8gbG9hZC5cbiAqIEBwYXJhbSBbcGFyYW1zLm1hcHNBcGlLZXldIC0gR29vZ2xlIE1hcHMgYXBpIGtleS5cbiAqIEByZXR1cm5zXG4gKi8gZnVuY3Rpb24gdXNlTG9hZEdvb2dsZUNoYXJ0cyhwYXJhbSkge1xuICAgIGxldCB7IGNoYXJ0VmVyc2lvbiA9XCJjdXJyZW50XCIgLCBjaGFydFBhY2thZ2VzID1bXG4gICAgICAgIFwiY29yZWNoYXJ0XCIsXG4gICAgICAgIFwiY29udHJvbHNcIlxuICAgIF0gLCBjaGFydExhbmd1YWdlID1cImVuXCIgLCBtYXBzQXBpS2V5ICB9ID0gcGFyYW07XG4gICAgY29uc3QgW2dvb2dsZUNoYXJ0cywgc2V0R29vZ2xlQ2hhcnRzXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtmYWlsZWQsIHNldEZhaWxlZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgdXNlTG9hZFNjcmlwdChcImh0dHBzOi8vd3d3LmdzdGF0aWMuY29tL2NoYXJ0cy9sb2FkZXIuanNcIiwgKCk9PntcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBHZXR0aW5nIG9iamVjdCBmcm9tIGdsb2JhbCBuYW1lc3BhY2UuXG4gICAgICAgIGNvbnN0IGdvb2dsZSA9IHdpbmRvdyA9PT0gbnVsbCB8fCB3aW5kb3cgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHdpbmRvdy5nb29nbGU7XG4gICAgICAgIGlmICghZ29vZ2xlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZ29vZ2xlLmNoYXJ0cy5sb2FkKGNoYXJ0VmVyc2lvbiwge1xuICAgICAgICAgICAgcGFja2FnZXM6IGNoYXJ0UGFja2FnZXMsXG4gICAgICAgICAgICBsYW5ndWFnZTogY2hhcnRMYW5ndWFnZSxcbiAgICAgICAgICAgIG1hcHNBcGlLZXlcbiAgICAgICAgfSk7XG4gICAgICAgIGdvb2dsZS5jaGFydHMuc2V0T25Mb2FkQ2FsbGJhY2soKCk9PntcbiAgICAgICAgICAgIHNldEdvb2dsZUNoYXJ0cyhnb29nbGUpO1xuICAgICAgICB9KTtcbiAgICB9LCAoKT0+e1xuICAgICAgICBzZXRGYWlsZWQodHJ1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgZ29vZ2xlQ2hhcnRzLFxuICAgICAgICBmYWlsZWRcbiAgICBdO1xufVxuLyoqXG4gKiBXcmFwcGVyIGFyb3VuZCB1c2VMb2FkR29vZ2xlQ2hhcnRzIHRvIHVzZSBpbiBsZWdhY3kgY29tcG9uZW50cy5cbiAqLyBmdW5jdGlvbiBMb2FkR29vZ2xlQ2hhcnRzKHBhcmFtKSB7XG4gICAgbGV0IHsgb25Mb2FkICwgb25FcnJvciAsIC4uLnBhcmFtcyB9ID0gcGFyYW07XG4gICAgY29uc3QgW2dvb2dsZUNoYXJ0cywgZmFpbGVkXSA9IHVzZUxvYWRHb29nbGVDaGFydHMocGFyYW1zKTtcbiAgICB1c2VFZmZlY3QoKCk9PntcbiAgICAgICAgaWYgKGdvb2dsZUNoYXJ0cyAmJiBvbkxvYWQpIHtcbiAgICAgICAgICAgIG9uTG9hZChnb29nbGVDaGFydHMpO1xuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICBnb29nbGVDaGFydHNcbiAgICBdKTtcbiAgICB1c2VFZmZlY3QoKCk9PntcbiAgICAgICAgaWYgKGZhaWxlZCAmJiBvbkVycm9yKSB7XG4gICAgICAgICAgICBvbkVycm9yKCk7XG4gICAgICAgIH1cbiAgICB9LCBbXG4gICAgICAgIGZhaWxlZFxuICAgIF0pO1xuICAgIHJldHVybiBudWxsO1xufVxuXG5jb25zdCBjaGFydERlZmF1bHRQcm9wcyA9IHtcbiAgICAvLyA8REVQUkVDQVRFRF9QUk9QUz5cbiAgICBsZWdlbmRfdG9nZ2xlOiBmYWxzZSxcbiAgICAvLyA8L0RFUFJFQ0FURURfUFJPUFM+XG4gICAgb3B0aW9uczoge30sXG4gICAgbGVnZW5kVG9nZ2xlOiBmYWxzZSxcbiAgICBnZXRDaGFydFdyYXBwZXI6ICgpPT57fSxcbiAgICBzcHJlYWRTaGVldFF1ZXJ5UGFyYW1ldGVyczoge1xuICAgICAgICBoZWFkZXJzOiAxLFxuICAgICAgICBnaWQ6IDFcbiAgICB9LFxuICAgIHJvb3RQcm9wczoge30sXG4gICAgY2hhcnRXcmFwcGVyUGFyYW1zOiB7fVxufTtcblxubGV0IHVuaXF1ZUlEID0gMDtcbmNvbnN0IGdlbmVyYXRlVW5pcXVlSUQgPSAoKT0+e1xuICAgIHVuaXF1ZUlEICs9IDE7XG4gICAgcmV0dXJuIFwicmVhY3Rnb29nbGVncmFwaC1cIi5jb25jYXQodW5pcXVlSUQpO1xufTtcblxuY29uc3QgREVGQVVMVF9DSEFSVF9DT0xPUlMgPSBbXG4gICAgXCIjMzM2NkNDXCIsXG4gICAgXCIjREMzOTEyXCIsXG4gICAgXCIjRkY5OTAwXCIsXG4gICAgXCIjMTA5NjE4XCIsXG4gICAgXCIjOTkwMDk5XCIsXG4gICAgXCIjM0IzRUFDXCIsXG4gICAgXCIjMDA5OUM2XCIsXG4gICAgXCIjREQ0NDc3XCIsXG4gICAgXCIjNjZBQTAwXCIsXG4gICAgXCIjQjgyRTJFXCIsXG4gICAgXCIjMzE2Mzk1XCIsXG4gICAgXCIjOTk0NDk5XCIsXG4gICAgXCIjMjJBQTk5XCIsXG4gICAgXCIjQUFBQTExXCIsXG4gICAgXCIjNjYzM0NDXCIsXG4gICAgXCIjRTY3MzAwXCIsXG4gICAgXCIjOEIwNzA3XCIsXG4gICAgXCIjMzI5MjYyXCIsXG4gICAgXCIjNTU3NEE2XCIsXG4gICAgXCIjM0IzRUFDXCJcbl07XG5cbmNvbnN0IGxvYWREYXRhVGFibGVGcm9tU3ByZWFkU2hlZXQgPSBhc3luYyBmdW5jdGlvbihnb29nbGVWaXosIHNwcmVhZFNoZWV0VXJsKSB7XG4gICAgbGV0IHVybFBhcmFtcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzJdIDoge307XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBcIlwiLmNvbmNhdCh1cmxQYXJhbXMuaGVhZGVycyA/IFwiaGVhZGVycz1cIi5jb25jYXQodXJsUGFyYW1zLmhlYWRlcnMpIDogXCJoZWFkZXJzPTBcIik7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gXCJcIi5jb25jYXQodXJsUGFyYW1zLnF1ZXJ5ID8gXCImdHE9XCIuY29uY2F0KGVuY29kZVVSSUNvbXBvbmVudCh1cmxQYXJhbXMucXVlcnkpKSA6IFwiXCIpO1xuICAgICAgICBjb25zdCBnaWQgPSBcIlwiLmNvbmNhdCh1cmxQYXJhbXMuZ2lkID8gXCImZ2lkPVwiLmNvbmNhdCh1cmxQYXJhbXMuZ2lkKSA6IFwiXCIpO1xuICAgICAgICBjb25zdCBzaGVldCA9IFwiXCIuY29uY2F0KHVybFBhcmFtcy5zaGVldCA/IFwiJnNoZWV0PVwiLmNvbmNhdCh1cmxQYXJhbXMuc2hlZXQpIDogXCJcIik7XG4gICAgICAgIGNvbnN0IGFjY2Vzc190b2tlbiA9IFwiXCIuY29uY2F0KHVybFBhcmFtcy5hY2Nlc3NfdG9rZW4gPyBcIiZhY2Nlc3NfdG9rZW49XCIuY29uY2F0KHVybFBhcmFtcy5hY2Nlc3NfdG9rZW4pIDogXCJcIik7XG4gICAgICAgIGNvbnN0IHVybFF1ZXJ5U3RyaW5nID0gXCJcIi5jb25jYXQoaGVhZGVycykuY29uY2F0KGdpZCkuY29uY2F0KHNoZWV0KS5jb25jYXQocXVlcnlTdHJpbmcpLmNvbmNhdChhY2Nlc3NfdG9rZW4pO1xuICAgICAgICBjb25zdCB1cmxUb1NwcmVhZFNoZWV0ID0gXCJcIi5jb25jYXQoc3ByZWFkU2hlZXRVcmwsIFwiL2d2aXovdHE/XCIpLmNvbmNhdCh1cmxRdWVyeVN0cmluZyk7IC8vJnRxPSR7cXVlcnlTdHJpbmd9YDtcbiAgICAgICAgY29uc3QgcXVlcnkgPSBuZXcgZ29vZ2xlVml6LnZpc3VhbGl6YXRpb24uUXVlcnkodXJsVG9TcHJlYWRTaGVldCk7XG4gICAgICAgIHF1ZXJ5LnNlbmQoKHJlc3BvbnNlKT0+e1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmlzRXJyb3IoKSkge1xuICAgICAgICAgICAgICAgIHJlamVjdChcIkVycm9yIGluIHF1ZXJ5OiAgXCIuY29uY2F0KHJlc3BvbnNlLmdldE1lc3NhZ2UoKSwgXCIgXCIpLmNvbmNhdChyZXNwb25zZS5nZXREZXRhaWxlZE1lc3NhZ2UoKSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlLmdldERhdGFUYWJsZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5jb25zdCB7IFByb3ZpZGVyICwgQ29uc3VtZXIgIH0gPSAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUNvbnRleHQoY2hhcnREZWZhdWx0UHJvcHMpO1xuY29uc3QgQ29udGV4dFByb3ZpZGVyID0gKHBhcmFtKT0+e1xuICAgIGxldCB7IGNoaWxkcmVuICwgdmFsdWUgIH0gPSBwYXJhbTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFByb3ZpZGVyLCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0sIGNoaWxkcmVuKTtcbn07XG5jb25zdCBDb250ZXh0Q29uc3VtZXIgPSAocGFyYW0pPT57XG4gICAgbGV0IHsgcmVuZGVyICB9ID0gcGFyYW07XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChDb25zdW1lciwgbnVsbCwgKGNvbnRleHQpPT57XG4gICAgICAgIHJldHVybiByZW5kZXIoY29udGV4dCk7XG4gICAgfSk7XG59O1xuXG5jb25zdCBHUkFZX0NPTE9SID0gXCIjQ0NDQ0NDXCI7XG5jbGFzcyBHb29nbGVDaGFydERhdGFUYWJsZUlubmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5kcmF3KHRoaXMucHJvcHMpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubGVnZW5kX3RvZ2dsZSB8fCB0aGlzLnByb3BzLmxlZ2VuZFRvZ2dsZSkge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5Ub0xlZ2VuZFRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBjb25zdCB7IGdvb2dsZSAsIGdvb2dsZUNoYXJ0V3JhcHBlciAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMub25SZXNpemUpO1xuICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMucmVtb3ZlQWxsTGlzdGVuZXJzKGdvb2dsZUNoYXJ0V3JhcHBlcik7XG4gICAgICAgIGlmIChnb29nbGVDaGFydFdyYXBwZXIuZ2V0Q2hhcnRUeXBlKCkgPT09IFwiVGltZWxpbmVcIikge1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldENoYXJ0KCkgJiYgZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldENoYXJ0KCkuY2xlYXJDaGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5kcmF3KHRoaXMucHJvcHMpO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBoaWRkZW5Db2x1bW5zOiBbXVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmxpc3RlblRvTGVnZW5kVG9nZ2xlID0gKCk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgZ29vZ2xlICwgZ29vZ2xlQ2hhcnRXcmFwcGVyICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGdvb2dsZS52aXN1YWxpemF0aW9uLmV2ZW50cy5hZGRMaXN0ZW5lcihnb29nbGVDaGFydFdyYXBwZXIsIFwic2VsZWN0XCIsICgpPT57XG4gICAgICAgICAgICAgICAgY29uc3QgY2hhcnQgPSBnb29nbGVDaGFydFdyYXBwZXIuZ2V0Q2hhcnQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBjaGFydC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhVGFibGUgPSBnb29nbGVDaGFydFdyYXBwZXIuZ2V0RGF0YVRhYmxlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGlvbi5sZW5ndGggPT09IDAgfHwgLy8gV2Ugd2FudCB0byBsaXN0ZW4gdG8gd2hlbiBhIHdob2xlIHJvdyBpcyBzZWxlY3RlZC4gVGhpcyBpcyB0aGUgY2FzZSBvbmx5IHdoZW4gcm93ID09PSBudWxsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uWzBdLnJvdyB8fCAhZGF0YVRhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgY29sdW1uSW5kZXggPSBzZWxlY3Rpb25bMF0uY29sdW1uO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbklEID0gdGhpcy5nZXRDb2x1bW5JRChkYXRhVGFibGUsIGNvbHVtbkluZGV4KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5oaWRkZW5Db2x1bW5zLmluY2x1ZGVzKGNvbHVtbklEKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKChzdGF0ZSk9Pih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlkZGVuQ29sdW1uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5oaWRkZW5Db2x1bW5zLmZpbHRlcigoY29sSUQpPT5jb2xJRCAhPT0gY29sdW1uSUQpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSgoc3RhdGUpPT4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZGRlbkNvbHVtbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuaGlkZGVuQ29sdW1ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uSURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYXBwbHlGb3JtYXR0ZXJzID0gKGRhdGFUYWJsZSwgZm9ybWF0dGVycyk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgZ29vZ2xlICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGZvciAobGV0IGZvcm1hdHRlciBvZiBmb3JtYXR0ZXJzKXtcbiAgICAgICAgICAgICAgICBzd2l0Y2goZm9ybWF0dGVyLnR5cGUpe1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQXJyb3dGb3JtYXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2aXpGb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQXJyb3dGb3JtYXQoZm9ybWF0dGVyLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpekZvcm1hdHRlci5mb3JtYXQoZGF0YVRhYmxlLCBmb3JtYXR0ZXIuY29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkJhckZvcm1hdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZpekZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5CYXJGb3JtYXQoZm9ybWF0dGVyLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpekZvcm1hdHRlci5mb3JtYXQoZGF0YVRhYmxlLCBmb3JtYXR0ZXIuY29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkNvbG9yRm9ybWF0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgdml6Rm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbG9yRm9ybWF0KGZvcm1hdHRlci5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHJhbmdlcyAgfSA9IGZvcm1hdHRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCByYW5nZSBvZiByYW5nZXMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXpGb3JtYXR0ZXIuYWRkUmFuZ2UoLi4ucmFuZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXpGb3JtYXR0ZXIuZm9ybWF0KGRhdGFUYWJsZSwgZm9ybWF0dGVyLmNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJEYXRlRm9ybWF0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgdml6Rm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGVGb3JtYXQoZm9ybWF0dGVyLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpekZvcm1hdHRlci5mb3JtYXQoZGF0YVRhYmxlLCBmb3JtYXR0ZXIuY29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk51bWJlckZvcm1hdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZpekZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5OdW1iZXJGb3JtYXQoZm9ybWF0dGVyLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpekZvcm1hdHRlci5mb3JtYXQoZGF0YVRhYmxlLCBmb3JtYXR0ZXIuY29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlBhdHRlcm5Gb3JtYXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2aXpGb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uUGF0dGVybkZvcm1hdChmb3JtYXR0ZXIub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdml6Rm9ybWF0dGVyLmZvcm1hdChkYXRhVGFibGUsIGZvcm1hdHRlci5jb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRDb2x1bW5JRCA9IChkYXRhVGFibGUsIGNvbHVtbkluZGV4KT0+e1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFUYWJsZS5nZXRDb2x1bW5JZChjb2x1bW5JbmRleCkgfHwgZGF0YVRhYmxlLmdldENvbHVtbkxhYmVsKGNvbHVtbkluZGV4KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5kcmF3ID0gYXN5bmMgKHBhcmFtKT0+e1xuICAgICAgICAgICAgbGV0IHsgZGF0YSAsIGRpZmZkYXRhICwgcm93cyAsIGNvbHVtbnMgLCBvcHRpb25zICwgbGVnZW5kX3RvZ2dsZSAsIGxlZ2VuZFRvZ2dsZSAsIGNoYXJ0VHlwZSAsIGZvcm1hdHRlcnMgLCBzcHJlYWRTaGVldFVybCAsIHNwcmVhZFNoZWV0UXVlcnlQYXJhbWV0ZXJzICB9ID0gcGFyYW07XG4gICAgICAgICAgICBjb25zdCB7IGdvb2dsZSAsIGdvb2dsZUNoYXJ0V3JhcHBlciAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBsZXQgZGF0YVRhYmxlO1xuICAgICAgICAgICAgbGV0IGNoYXJ0RGlmZiA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZGlmZmRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGREYXRhID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkaWZmZGF0YS5vbGQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0RhdGEgPSBnb29nbGUudmlzdWFsaXphdGlvbi5hcnJheVRvRGF0YVRhYmxlKGRpZmZkYXRhLm5ldyk7XG4gICAgICAgICAgICAgICAgY2hhcnREaWZmID0gZ29vZ2xlLnZpc3VhbGl6YXRpb25bY2hhcnRUeXBlXS5wcm90b3R5cGUuY29tcHV0ZURpZmYob2xkRGF0YSwgbmV3RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFUYWJsZSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVRhYmxlID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZShkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJvd3MgJiYgY29sdW1ucykge1xuICAgICAgICAgICAgICAgIGRhdGFUYWJsZSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoW1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zLFxuICAgICAgICAgICAgICAgICAgICAuLi5yb3dzXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNwcmVhZFNoZWV0VXJsKSB7XG4gICAgICAgICAgICAgICAgZGF0YVRhYmxlID0gYXdhaXQgbG9hZERhdGFUYWJsZUZyb21TcHJlYWRTaGVldChnb29nbGUsIHNwcmVhZFNoZWV0VXJsLCBzcHJlYWRTaGVldFF1ZXJ5UGFyYW1ldGVycyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRhdGFUYWJsZSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY29sdW1uQ291bnQgPSBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7XG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgY29sdW1uQ291bnQ7IGkgKz0gMSl7XG4gICAgICAgICAgICAgICAgY29uc3QgY29sdW1uSUQgPSB0aGlzLmdldENvbHVtbklEKGRhdGFUYWJsZSwgaSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGlkZGVuQ29sdW1ucy5pbmNsdWRlcyhjb2x1bW5JRCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXNDb2x1bW5MYWJlbCA9IGRhdGFUYWJsZS5nZXRDb2x1bW5MYWJlbChpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXNDb2x1bW5JRCA9IGRhdGFUYWJsZS5nZXRDb2x1bW5JZChpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXNDb2x1bW5UeXBlID0gZGF0YVRhYmxlLmdldENvbHVtblR5cGUoaSk7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFUYWJsZS5yZW1vdmVDb2x1bW4oaSk7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFUYWJsZS5hZGRDb2x1bW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHByZXZpb3VzQ29sdW1uTGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogcHJldmlvdXNDb2x1bW5JRCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHByZXZpb3VzQ29sdW1uVHlwZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjaGFydCA9IGdvb2dsZUNoYXJ0V3JhcHBlci5nZXRDaGFydCgpO1xuICAgICAgICAgICAgaWYgKGdvb2dsZUNoYXJ0V3JhcHBlci5nZXRDaGFydFR5cGUoKSA9PT0gXCJUaW1lbGluZVwiKSB7XG4gICAgICAgICAgICAgICAgY2hhcnQgJiYgY2hhcnQuY2xlYXJDaGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldENoYXJ0VHlwZShjaGFydFR5cGUpO1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldE9wdGlvbnMob3B0aW9ucyB8fCB7fSk7XG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuc2V0RGF0YVRhYmxlKGRhdGFUYWJsZSk7XG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuZHJhdygpO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZ29vZ2xlQ2hhcnREYXNoYm9hcmQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdvb2dsZUNoYXJ0RGFzaGJvYXJkLmRyYXcoZGF0YVRhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGFydERpZmYpIHtcbiAgICAgICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuc2V0RGF0YVRhYmxlKGNoYXJ0RGlmZik7XG4gICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLmRyYXcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmb3JtYXR0ZXJzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseUZvcm1hdHRlcnMoZGF0YVRhYmxlLCBmb3JtYXR0ZXJzKTtcbiAgICAgICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuc2V0RGF0YVRhYmxlKGRhdGFUYWJsZSk7XG4gICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLmRyYXcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZWdlbmRUb2dnbGUgPT09IHRydWUgfHwgbGVnZW5kX3RvZ2dsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JheU91dEhpZGRlbkNvbHVtbnMoe1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ3JheU91dEhpZGRlbkNvbHVtbnMgPSAocGFyYW0pPT57XG4gICAgICAgICAgICBsZXQgeyBvcHRpb25zICB9ID0gcGFyYW07XG4gICAgICAgICAgICBjb25zdCB7IGdvb2dsZUNoYXJ0V3JhcHBlciAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCBkYXRhVGFibGUgPSBnb29nbGVDaGFydFdyYXBwZXIuZ2V0RGF0YVRhYmxlKCk7XG4gICAgICAgICAgICBpZiAoIWRhdGFUYWJsZSkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgY29sdW1uQ291bnQgPSBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7XG4gICAgICAgICAgICBjb25zdCBoYXNBSGlkZGVuQ29sdW1uID0gdGhpcy5zdGF0ZS5oaWRkZW5Db2x1bW5zLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICBpZiAoaGFzQUhpZGRlbkNvbHVtbiA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGNvbG9ycyA9IEFycmF5LmZyb20oe1xuICAgICAgICAgICAgICAgIGxlbmd0aDogY29sdW1uQ291bnQgLSAxXG4gICAgICAgICAgICB9KS5tYXAoKGRvbnRjYXJlLCBpKT0+e1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbklEID0gdGhpcy5nZXRDb2x1bW5JRChkYXRhVGFibGUsIGkgKyAxKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5oaWRkZW5Db2x1bW5zLmluY2x1ZGVzKGNvbHVtbklEKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gR1JBWV9DT0xPUjtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5jb2xvcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuY29sb3JzW2ldO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBERUZBVUxUX0NIQVJUX0NPTE9SU1tpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5zZXRPcHRpb25zKHtcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGNvbG9yc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuZHJhdygpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9uUmVzaXplID0gKCk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgZ29vZ2xlQ2hhcnRXcmFwcGVyICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5kcmF3KCk7XG4gICAgICAgIH07XG4gICAgfVxufVxuY2xhc3MgR29vZ2xlQ2hhcnREYXRhVGFibGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbXBvbmVudERpZE1vdW50KCkge31cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHt9XG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgeyBnb29nbGUgLCBnb29nbGVDaGFydFdyYXBwZXIgLCBnb29nbGVDaGFydERhc2hib2FyZCAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29udGV4dENvbnN1bWVyLCB7XG4gICAgICAgICAgICByZW5kZXI6IChwcm9wcyk9PntcbiAgICAgICAgICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KEdvb2dsZUNoYXJ0RGF0YVRhYmxlSW5uZXIsIE9iamVjdC5hc3NpZ24oe30sIHByb3BzLCB7XG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZTogZ29vZ2xlLFxuICAgICAgICAgICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXI6IGdvb2dsZUNoYXJ0V3JhcHBlcixcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnREYXNoYm9hcmQ6IGdvb2dsZUNoYXJ0RGFzaGJvYXJkXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNsYXNzIEdvb2dsZUNoYXJ0RXZlbnRzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbGlzdGVuVG9FdmVudHMocGFyYW0pIHtcbiAgICAgICAgbGV0IHsgY2hhcnRFdmVudHMgLCBnb29nbGUgLCBnb29nbGVDaGFydFdyYXBwZXIgIH0gPSBwYXJhbTtcbiAgICAgICAgaWYgKCFjaGFydEV2ZW50cykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGdvb2dsZS52aXN1YWxpemF0aW9uLmV2ZW50cy5yZW1vdmVBbGxMaXN0ZW5lcnMoZ29vZ2xlQ2hhcnRXcmFwcGVyKTtcbiAgICAgICAgZm9yIChsZXQgZXZlbnQgb2YgY2hhcnRFdmVudHMpe1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIGNvbnN0IHsgZXZlbnROYW1lICwgY2FsbGJhY2sgIH0gPSBldmVudDtcbiAgICAgICAgICAgIGdvb2dsZS52aXN1YWxpemF0aW9uLmV2ZW50cy5hZGRMaXN0ZW5lcihnb29nbGVDaGFydFdyYXBwZXIsIGV2ZW50TmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5Kyspe1xuICAgICAgICAgICAgICAgICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0V3JhcHBlcjogZ29vZ2xlQ2hhcnRXcmFwcGVyLFxuICAgICAgICAgICAgICAgICAgICBwcm9wczogX3RoaXMucHJvcHMsXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZTogZ29vZ2xlLFxuICAgICAgICAgICAgICAgICAgICBldmVudEFyZ3M6IGFyZ3NcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB2YXIgcmVmO1xuICAgICAgICBjb25zdCB7IGdvb2dsZSAsIGdvb2dsZUNoYXJ0V3JhcHBlciAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHRoaXMubGlzdGVuVG9FdmVudHMoe1xuICAgICAgICAgICAgY2hhcnRFdmVudHM6ICgocmVmID0gdGhpcy5wcm9wc0Zyb21Db250ZXh0KSA9PT0gbnVsbCB8fCByZWYgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHJlZi5jaGFydEV2ZW50cykgfHwgbnVsbCxcbiAgICAgICAgICAgIGdvb2dsZSxcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlclxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLnByb3BzO1xuICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KENvbnRleHRDb25zdW1lciwge1xuICAgICAgICAgICAgcmVuZGVyOiAocHJvcHNGcm9tQ29udGV4dCk9PntcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzRnJvbUNvbnRleHQgPSBwcm9wc0Zyb21Db250ZXh0O1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IocHJvcHMpe1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMucHJvcHNGcm9tQ29udGV4dCA9IG51bGw7XG4gICAgfVxufVxuXG5sZXQgY29udHJvbENvdW50ZXIgPSAwO1xuY2xhc3MgR29vZ2xlQ2hhcnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCB7IG9wdGlvbnMgLCBnb29nbGUgLCBjaGFydFR5cGUgLCBjaGFydFdyYXBwZXJQYXJhbXMgLCB0b29sYmFySXRlbXMgLCBnZXRDaGFydEVkaXRvciAsIGdldENoYXJ0V3JhcHBlciAsICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgY2hhcnRDb25maWcgPSB7XG4gICAgICAgICAgICBjaGFydFR5cGUsXG4gICAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgICAgY29udGFpbmVySWQ6IHRoaXMuZ2V0R3JhcGhJRCgpLFxuICAgICAgICAgICAgLi4uY2hhcnRXcmFwcGVyUGFyYW1zXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGdvb2dsZUNoYXJ0V3JhcHBlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5DaGFydFdyYXBwZXIoY2hhcnRDb25maWcpO1xuICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuc2V0T3B0aW9ucyhvcHRpb25zIHx8IHt9KTtcbiAgICAgICAgaWYgKGdldENoYXJ0V3JhcHBlcikge1xuICAgICAgICAgICAgZ2V0Q2hhcnRXcmFwcGVyKGdvb2dsZUNoYXJ0V3JhcHBlciwgZ29vZ2xlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBnb29nbGVDaGFydERhc2hib2FyZCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXNoYm9hcmQodGhpcy5kYXNoYm9hcmRfcmVmKTtcbiAgICAgICAgY29uc3QgZ29vZ2xlQ2hhcnRDb250cm9scyA9IHRoaXMuYWRkQ29udHJvbHMoZ29vZ2xlQ2hhcnRXcmFwcGVyLCBnb29nbGVDaGFydERhc2hib2FyZCk7XG4gICAgICAgIGlmICh0b29sYmFySXRlbXMpIHtcbiAgICAgICAgICAgIGdvb2dsZS52aXN1YWxpemF0aW9uLmRyYXdUb29sYmFyKHRoaXMudG9vbGJhcl9yZWYuY3VycmVudCwgdG9vbGJhckl0ZW1zKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZ29vZ2xlQ2hhcnRFZGl0b3IgPSBudWxsO1xuICAgICAgICBpZiAoZ2V0Q2hhcnRFZGl0b3IpIHtcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0RWRpdG9yID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNoYXJ0RWRpdG9yKCk7XG4gICAgICAgICAgICBnZXRDaGFydEVkaXRvcih7XG4gICAgICAgICAgICAgICAgY2hhcnRFZGl0b3I6IGdvb2dsZUNoYXJ0RWRpdG9yLFxuICAgICAgICAgICAgICAgIGNoYXJ0V3JhcHBlcjogZ29vZ2xlQ2hhcnRXcmFwcGVyLFxuICAgICAgICAgICAgICAgIGdvb2dsZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBnb29nbGVDaGFydEVkaXRvcixcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0Q29udHJvbHM6IGdvb2dsZUNoYXJ0Q29udHJvbHMsXG4gICAgICAgICAgICBnb29nbGVDaGFydERhc2hib2FyZDogZ29vZ2xlQ2hhcnREYXNoYm9hcmQsXG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIsXG4gICAgICAgICAgICBpc1JlYWR5OiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5nb29nbGVDaGFydFdyYXBwZXIpIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmdvb2dsZUNoYXJ0RGFzaGJvYXJkKSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5nb29nbGVDaGFydENvbnRyb2xzKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHsgY29udHJvbHMgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBpZiAoY29udHJvbHMpIHtcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBjb250cm9scy5sZW5ndGg7IGkgKz0gMSl7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBjb250cm9sVHlwZSAsIG9wdGlvbnMgLCBjb250cm9sV3JhcHBlclBhcmFtcyAgfSA9IGNvbnRyb2xzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChjb250cm9sV3JhcHBlclBhcmFtcyAmJiBcInN0YXRlXCIgaW4gY29udHJvbFdyYXBwZXJQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5nb29nbGVDaGFydENvbnRyb2xzW2ldLmNvbnRyb2wuc2V0U3RhdGUoY29udHJvbFdyYXBwZXJQYXJhbXNbXCJzdGF0ZVwiXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRDb250cm9sc1tpXS5jb250cm9sLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5nb29nbGVDaGFydENvbnRyb2xzW2ldLmNvbnRyb2wuc2V0Q29udHJvbFR5cGUoY29udHJvbFR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5pc1JlYWR5ICE9PSBuZXh0U3RhdGUuaXNSZWFkeSB8fCBuZXh0UHJvcHMuY29udHJvbHMgIT09IHRoaXMucHJvcHMuY29udHJvbHM7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgeyB3aWR0aCAsIGhlaWdodCAsIG9wdGlvbnMgLCBzdHlsZSAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IGRpdlN0eWxlID0ge1xuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQgfHwgb3B0aW9ucyAmJiBvcHRpb25zLmhlaWdodCxcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCB8fCBvcHRpb25zICYmIG9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICAuLi5zdHlsZVxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yZW5kZXIpIHtcbiAgICAgICAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgICAgICAgICAgIHJlZjogdGhpcy5kYXNoYm9hcmRfcmVmLFxuICAgICAgICAgICAgICAgIHN0eWxlOiBkaXZTdHlsZVxuICAgICAgICAgICAgfSwgLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgICAgICAgICByZWY6IHRoaXMudG9vbGJhcl9yZWYsXG4gICAgICAgICAgICAgICAgaWQ6IFwidG9vbGJhclwiXG4gICAgICAgICAgICB9KSwgdGhpcy5wcm9wcy5yZW5kZXIoe1xuICAgICAgICAgICAgICAgIHJlbmRlckNoYXJ0OiB0aGlzLnJlbmRlckNoYXJ0LFxuICAgICAgICAgICAgICAgIHJlbmRlckNvbnRyb2w6IHRoaXMucmVuZGVyQ29udHJvbCxcbiAgICAgICAgICAgICAgICByZW5kZXJUb29sYmFyOiB0aGlzLnJlbmRlclRvb2xCYXJcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgICAgICAgICAgIHJlZjogdGhpcy5kYXNoYm9hcmRfcmVmLFxuICAgICAgICAgICAgICAgIHN0eWxlOiBkaXZTdHlsZVxuICAgICAgICAgICAgfSwgdGhpcy5yZW5kZXJDb250cm9sKChwYXJhbSk9PntcbiAgICAgICAgICAgICAgICBsZXQgeyBjb250cm9sUHJvcCAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb250cm9sUHJvcC5jb250cm9sUG9zaXRpb24gIT09IFwiYm90dG9tXCI7XG4gICAgICAgICAgICB9KSwgdGhpcy5yZW5kZXJDaGFydCgpLCB0aGlzLnJlbmRlckNvbnRyb2woKHBhcmFtKT0+e1xuICAgICAgICAgICAgICAgIGxldCB7IGNvbnRyb2xQcm9wICB9ID0gcGFyYW07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRyb2xQcm9wLmNvbnRyb2xQb3NpdGlvbiA9PT0gXCJib3R0b21cIjtcbiAgICAgICAgICAgIH0pLCB0aGlzLnJlbmRlclRvb2xCYXIoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3RydWN0b3IoLi4uYXJnczEpe1xuICAgICAgICB2YXIgX3RoaXMxO1xuICAgICAgICBzdXBlciguLi5hcmdzMSksIF90aGlzMSA9IHRoaXM7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXI6IG51bGwsXG4gICAgICAgICAgICBnb29nbGVDaGFydERhc2hib2FyZDogbnVsbCxcbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0Q29udHJvbHM6IG51bGwsXG4gICAgICAgICAgICBnb29nbGVDaGFydEVkaXRvcjogbnVsbCxcbiAgICAgICAgICAgIGlzUmVhZHk6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ3JhcGhJRCA9IG51bGw7XG4gICAgICAgIHRoaXMuZGFzaGJvYXJkX3JlZiA9IC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlUmVmKCk7XG4gICAgICAgIHRoaXMudG9vbGJhcl9yZWYgPSAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZVJlZigpO1xuICAgICAgICB0aGlzLmdldEdyYXBoSUQgPSAoKT0+e1xuICAgICAgICAgICAgY29uc3QgeyBncmFwaElEICwgZ3JhcGhfaWQgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgbGV0IGluc3RhbmNlR3JhcGhJRDtcbiAgICAgICAgICAgIGlmICghZ3JhcGhJRCAmJiAhZ3JhcGhfaWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZ3JhcGhJRCkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUdyYXBoSUQgPSBnZW5lcmF0ZVVuaXF1ZUlEKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VHcmFwaElEID0gdGhpcy5ncmFwaElEO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ3JhcGhJRCAmJiAhZ3JhcGhfaWQpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUdyYXBoSUQgPSBncmFwaElEO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChncmFwaF9pZCAmJiAhZ3JhcGhJRCkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlR3JhcGhJRCA9IGdyYXBoX2lkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUdyYXBoSUQgPSBncmFwaElEO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ncmFwaElEID0gaW5zdGFuY2VHcmFwaElEO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ3JhcGhJRDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRDb250cm9sSUQgPSAoaWQsIGluZGV4KT0+e1xuICAgICAgICAgICAgY29udHJvbENvdW50ZXIgKz0gMTtcbiAgICAgICAgICAgIGxldCBjb250cm9sSUQ7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlkID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgY29udHJvbElEID0gXCJnb29nbGVjaGFydC1jb250cm9sLVwiLmNvbmNhdChpbmRleCwgXCItXCIpLmNvbmNhdChjb250cm9sQ291bnRlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xJRCA9IGlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbnRyb2xJRDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRDb250cm9scyA9IChnb29nbGVDaGFydFdyYXBwZXIsIGdvb2dsZUNoYXJ0RGFzaGJvYXJkKT0+e1xuICAgICAgICAgICAgY29uc3QgeyBnb29nbGUgLCBjb250cm9scyAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCBnb29nbGVDaGFydENvbnRyb2xzID0gIWNvbnRyb2xzID8gbnVsbCA6IGNvbnRyb2xzLm1hcCgoY29udHJvbCwgaSk9PntcbiAgICAgICAgICAgICAgICBjb25zdCB7IGNvbnRyb2xJRDogY29udHJvbElETWF5YmUgLCBjb250cm9sVHlwZSAsIG9wdGlvbnM6IGNvbnRyb2xPcHRpb25zICwgY29udHJvbFdyYXBwZXJQYXJhbXMgLCAgfSA9IGNvbnRyb2w7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udHJvbElEID0gdGhpcy5nZXRDb250cm9sSUQoY29udHJvbElETWF5YmUsIGkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xQcm9wOiBjb250cm9sLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sOiBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29udHJvbFdyYXBwZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVySWQ6IGNvbnRyb2xJRCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29udHJvbE9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5jb250cm9sV3JhcHBlclBhcmFtc1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghZ29vZ2xlQ2hhcnRDb250cm9scykge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnREYXNoYm9hcmQuYmluZChnb29nbGVDaGFydENvbnRyb2xzLm1hcCgocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgbGV0IHsgY29udHJvbCAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb250cm9sO1xuICAgICAgICAgICAgfSksIGdvb2dsZUNoYXJ0V3JhcHBlcik7XG4gICAgICAgICAgICBmb3IgKGxldCBjaGFydENvbnRyb2wgb2YgZ29vZ2xlQ2hhcnRDb250cm9scyl7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBjb250cm9sICwgY29udHJvbFByb3AgIH0gPSBjaGFydENvbnRyb2w7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBjb250cm9sRXZlbnRzID1bXSAgfSA9IGNvbnRyb2xQcm9wO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGV2ZW50IG9mIGNvbnRyb2xFdmVudHMpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGNhbGxiYWNrICwgZXZlbnROYW1lICB9ID0gZXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZS52aXN1YWxpemF0aW9uLmV2ZW50cy5yZW1vdmVMaXN0ZW5lcihjb250cm9sLCBldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlLnZpc3VhbGl6YXRpb24uZXZlbnRzLmFkZExpc3RlbmVyKGNvbnRyb2wsIGV2ZW50TmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydFdyYXBwZXI6IGdvb2dsZUNoYXJ0V3JhcHBlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sV3JhcHBlcjogY29udHJvbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wczogX3RoaXMucHJvcHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xlOiBnb29nbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRBcmdzOiBhcmdzXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGdvb2dsZUNoYXJ0Q29udHJvbHM7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucmVuZGVyQ2hhcnQgPSAoKT0+e1xuICAgICAgICAgICAgY29uc3QgeyB3aWR0aCAsIGhlaWdodCAsIG9wdGlvbnMgLCBzdHlsZSAsIGNsYXNzTmFtZSAsIHJvb3RQcm9wcyAsIGdvb2dsZSAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCBkaXZTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCB8fCBvcHRpb25zICYmIG9wdGlvbnMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCB8fCBvcHRpb25zICYmIG9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICAgICAgLi4uc3R5bGVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgIGlkOiB0aGlzLmdldEdyYXBoSUQoKSxcbiAgICAgICAgICAgICAgICBzdHlsZTogZGl2U3R5bGUsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBjbGFzc05hbWVcbiAgICAgICAgICAgIH0sIHJvb3RQcm9wcyksIHRoaXMuc3RhdGUuaXNSZWFkeSAmJiB0aGlzLnN0YXRlLmdvb2dsZUNoYXJ0V3JhcHBlciAhPT0gbnVsbCA/IC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KEdvb2dsZUNoYXJ0RGF0YVRhYmxlLCB7XG4gICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyOiB0aGlzLnN0YXRlLmdvb2dsZUNoYXJ0V3JhcHBlcixcbiAgICAgICAgICAgICAgICBnb29nbGU6IGdvb2dsZSxcbiAgICAgICAgICAgICAgICBnb29nbGVDaGFydERhc2hib2FyZDogdGhpcy5zdGF0ZS5nb29nbGVDaGFydERhc2hib2FyZFxuICAgICAgICAgICAgfSksIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChHb29nbGVDaGFydEV2ZW50cywge1xuICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlcjogdGhpcy5zdGF0ZS5nb29nbGVDaGFydFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgZ29vZ2xlOiBnb29nbGVcbiAgICAgICAgICAgIH0pKSA6IG51bGwpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJlbmRlckNvbnRyb2wgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCBmaWx0ZXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1swXSA6IChwYXJhbSk9PntcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMxLnN0YXRlLmlzUmVhZHkgJiYgX3RoaXMxLnN0YXRlLmdvb2dsZUNoYXJ0Q29udHJvbHMgIT09IG51bGwgPyAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIF90aGlzMS5zdGF0ZS5nb29nbGVDaGFydENvbnRyb2xzLmZpbHRlcigocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgbGV0IHsgY29udHJvbFByb3AgLCBjb250cm9sICB9ID0gcGFyYW07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcih7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2wsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xQcm9wXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5tYXAoKHBhcmFtKT0+e1xuICAgICAgICAgICAgICAgIGxldCB7IGNvbnRyb2wgLCBjb250cm9sUHJvcCAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgICAgICAgICAgICAgICBrZXk6IGNvbnRyb2wuZ2V0Q29udGFpbmVySWQoKSxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbnRyb2wuZ2V0Q29udGFpbmVySWQoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpIDogbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yZW5kZXJUb29sQmFyID0gKCk9PntcbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy50b29sYmFySXRlbXMpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICAgICAgICAgICAgcmVmOiB0aGlzLnRvb2xiYXJfcmVmXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmNsYXNzIENoYXJ0JDEgZXh0ZW5kcyAoUmVhY3QuQ29tcG9uZW50KSB7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7IGNoYXJ0TGFuZ3VhZ2UgLCBjaGFydFBhY2thZ2VzICwgY2hhcnRWZXJzaW9uICwgbWFwc0FwaUtleSAsIGxvYWRlciAsIGVycm9yRWxlbWVudCAsICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChDb250ZXh0UHJvdmlkZXIsIHtcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnByb3BzXG4gICAgICAgIH0sIHRoaXMuc3RhdGUubG9hZGluZ1N0YXR1cyA9PT0gXCJyZWFkeVwiICYmIHRoaXMuc3RhdGUuZ29vZ2xlICE9PSBudWxsID8gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KEdvb2dsZUNoYXJ0LCBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICAgICAgICBnb29nbGU6IHRoaXMuc3RhdGUuZ29vZ2xlXG4gICAgICAgIH0pKSA6IHRoaXMuc3RhdGUubG9hZGluZ1N0YXR1cyA9PT0gXCJlcnJvcmVkXCIgJiYgZXJyb3JFbGVtZW50ID8gZXJyb3JFbGVtZW50IDogbG9hZGVyLCAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTG9hZEdvb2dsZUNoYXJ0cywge1xuICAgICAgICAgICAgY2hhcnRMYW5ndWFnZTogY2hhcnRMYW5ndWFnZSxcbiAgICAgICAgICAgIGNoYXJ0UGFja2FnZXM6IGNoYXJ0UGFja2FnZXMsXG4gICAgICAgICAgICBjaGFydFZlcnNpb246IGNoYXJ0VmVyc2lvbixcbiAgICAgICAgICAgIG1hcHNBcGlLZXk6IG1hcHNBcGlLZXksXG4gICAgICAgICAgICBvbkxvYWQ6IHRoaXMub25Mb2FkLFxuICAgICAgICAgICAgb25FcnJvcjogdGhpcy5vbkVycm9yXG4gICAgICAgIH0pKTtcbiAgICB9XG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX2lzTW91bnRlZCA9IHRydWU7XG4gICAgfVxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaXNGdWxseUxvYWRlZChnb29nbGUpIHtcbiAgICAgICAgY29uc3QgeyBjb250cm9scyAsIHRvb2xiYXJJdGVtcyAsIGdldENoYXJ0RWRpdG9yICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgcmV0dXJuIGdvb2dsZSAmJiBnb29nbGUudmlzdWFsaXphdGlvbiAmJiBnb29nbGUudmlzdWFsaXphdGlvbi5DaGFydFdyYXBwZXIgJiYgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGFzaGJvYXJkICYmICghY29udHJvbHMgfHwgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ2hhcnRXcmFwcGVyKSAmJiAoIWdldENoYXJ0RWRpdG9yIHx8IGdvb2dsZS52aXN1YWxpemF0aW9uLkNoYXJ0RWRpdG9yKSAmJiAoIXRvb2xiYXJJdGVtcyB8fCBnb29nbGUudmlzdWFsaXphdGlvbi5kcmF3VG9vbGJhcik7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBsb2FkaW5nU3RhdHVzOiBcImxvYWRpbmdcIixcbiAgICAgICAgICAgIGdvb2dsZTogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9uTG9hZCA9IChnb29nbGUxKT0+e1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25Mb2FkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkxvYWQoZ29vZ2xlMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5pc0Z1bGx5TG9hZGVkKGdvb2dsZTEpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblN1Y2Nlc3MoZ29vZ2xlMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElFMTE6IHdpbmRvdy5nb29nbGUgaXMgbm90IGZ1bGx5IHNldCwgd2UgaGF2ZSB0byB3YWl0XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKT0+e1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBnb29nbGUgPSB3aW5kb3cuZ29vZ2xlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faXNNb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ29vZ2xlICYmIHRoaXMuaXNGdWxseUxvYWRlZChnb29nbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblN1Y2Nlc3MoZ29vZ2xlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25TdWNjZXNzID0gKGdvb2dsZSk9PntcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmdTdGF0dXM6IFwicmVhZHlcIixcbiAgICAgICAgICAgICAgICBnb29nbGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9uRXJyb3IgPSAoKT0+e1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZ1N0YXR1czogXCJlcnJvcmVkXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cbn1cbkNoYXJ0JDEuZGVmYXVsdFByb3BzID0gY2hhcnREZWZhdWx0UHJvcHM7XG5cbnZhciBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZTtcbihmdW5jdGlvbihHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZSkge1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1wiYW5ub3RhdGlvblwiXSA9IFwiYW5ub3RhdGlvblwiO1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1wiYW5ub3RhdGlvblRleHRcIl0gPSBcImFubm90YXRpb25UZXh0XCI7XG4gICAgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGVbXCJjZXJ0YWludHlcIl0gPSBcImNlcnRhaW50eVwiO1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1wiZW1waGFzaXNcIl0gPSBcImVtcGhhc2lzXCI7XG4gICAgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGVbXCJpbnRlcnZhbFwiXSA9IFwiaW50ZXJ2YWxcIjtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcInNjb3BlXCJdID0gXCJzY29wZVwiO1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1wic3R5bGVcIl0gPSBcInN0eWxlXCI7XG4gICAgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGVbXCJ0b29sdGlwXCJdID0gXCJ0b29sdGlwXCI7XG4gICAgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGVbXCJkb21haW5cIl0gPSBcImRvbWFpblwiO1xufSkoR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGUgfHwgKEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlID0ge30pKTtcblxudmFyIENoYXJ0ID0gQ2hhcnQkMTtcblxuZXhwb3J0IHsgQ2hhcnQkMSBhcyBDaGFydCwgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGUsIENoYXJ0IGFzIGRlZmF1bHQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcFxuIiwiaW1wb3J0IHsgUmVhY3RFbGVtZW50LCBjcmVhdGVFbGVtZW50LCB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBPYmplY3RJdGVtIH0gZnJvbSAnbWVuZGl4JztcbmltcG9ydCBDaGFydCBmcm9tICdyZWFjdC1nb29nbGUtY2hhcnRzJztcblxuaW1wb3J0IHsgTmV3R2FudHRXaWRnZXRDb250YWluZXJQcm9wcyB9IGZyb20gXCIuLi90eXBpbmdzL05ld0dhbnR0V2lkZ2V0UHJvcHNcIjtcblxuaW1wb3J0IFwiLi91aS9OZXdHYW50dFdpZGdldC5jc3NcIjtcblxuLy8gRGVmaW5lIGEgdHlwZSBmb3IgdGhlIHJvd3MgaW4geW91ciBjaGFydCBkYXRhXG50eXBlIENoYXJ0RGF0YVR5cGUgPSAoc3RyaW5nIHwgRGF0ZSB8IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQpW11bXTsgXG5cbmV4cG9ydCBmdW5jdGlvbiBOZXdHYW50dFdpZGdldCh7IGRhdGFTb3VyY2UsIHRhc2tJZCwgdGFza05hbWUsIHRhc2tSZXNvdXJjZSwgc3RhcnREYXRlLCBlbmREYXRlLCB0YXNrRHVyYXRpb24sIHBlcmNlbnRDb21wbGV0ZSwgdGFza0RlcGVuZGVuY2llcywgcm93RGFya0NvbG9yLCByb3dOb3JtYWxDb2xvciwgZm9udFNpemUsIGZvbnRUeXBlLCBmb250Q29sb3IsIGdhbnR0SGVpZ2h0LCBzaG93Q3JpdGljYWxQYXRoIH06IE5ld0dhbnR0V2lkZ2V0Q29udGFpbmVyUHJvcHMpOiBSZWFjdEVsZW1lbnQge1xuXG4gICAgY29uc3QgW2NoYXJ0RGF0YSwgc2V0Q2hhcnREYXRhXSA9IHVzZVN0YXRlPENoYXJ0RGF0YVR5cGU+KFtdKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybURhdGEgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXI6IChzdHJpbmcgfCBEYXRlIHwgbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZClbXVtdID0gW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdUYXNrIElEJywgXG4gICAgICAgICAgICAgICAgICAnVGFzayBOYW1lJyxcbiAgICAgICAgICAgICAgICAgICdSZXNvdXJjZScsIFxuICAgICAgICAgICAgICAgICAgJ1N0YXJ0IERhdGUnLCBcbiAgICAgICAgICAgICAgICAgICdFbmQgRGF0ZScsIFxuICAgICAgICAgICAgICAgICAgJ0R1cmF0aW9uJywgXG4gICAgICAgICAgICAgICAgICAnUGVyY2VudCBDb21wbGV0ZScsIFxuICAgICAgICAgICAgICAgICAgJ0RlcGVuZGVuY2llcydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICBdO1xuIFxuICAgICAgICAgICAgaWYgKGRhdGFTb3VyY2UgJiYgZGF0YVNvdXJjZS5zdGF0dXMgPT09ICdhdmFpbGFibGUnICYmIGRhdGFTb3VyY2UuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJJdGVtczpcIiwgZGF0YVNvdXJjZS5pdGVtcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGRhdGFTb3VyY2UuaXRlbXMubWFwKChpdGVtOiBPYmplY3RJdGVtKSAgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJJdGVtOlwiLCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSXRlbSBUYXNrIElEOlwiLCB0YXNrSWQuZ2V0KGl0ZW0pLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSXRlbSBUYXNrIE5hbWU6XCIsIHRhc2tOYW1lLmdldChpdGVtKS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkl0ZW0gVGFzayBTdGFydDpcIiwgbmV3IERhdGUoc3RhcnREYXRlLmdldChpdGVtKS52YWx1ZSEpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSXRlbSBUYXNrIFN0YXJ0IHR5cGU6XCIsIHR5cGVvZihuZXcgRGF0ZShzdGFydERhdGUuZ2V0KGl0ZW0pLnZhbHVlISkpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSXRlbSBUYXNrIEVuZDpcIiwgZW5kRGF0ZS5nZXQoaXRlbSkudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJJdGVtIFRhc2sgQ29tcGxldGU6XCIsIHBlcmNlbnRDb21wbGV0ZS5nZXQoaXRlbSkudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJJdGVtIFRhc2sgRGVwZW5kZW5jaWVzOlwiLCB0YXNrRGVwZW5kZW5jaWVzLmdldChpdGVtKS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiTXkgU3VwZXIgVGFza1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoMjAyNCw0LDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoMjAyNCw0LDkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgOCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDQwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgICAgICBdOyovXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tJZC5nZXQoaXRlbSkudmFsdWU/LnRvU3RyaW5nKCkgfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tOYW1lLmdldChpdGVtKS52YWx1ZT8udG9TdHJpbmcoKSB8fCBcIlVubmFtZWQgVGFza1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFza1Jlc291cmNlLmdldChpdGVtKS52YWx1ZT8udG9TdHJpbmcoKSB8fCBcIlVubmFtZWQgUmVzb3VyY2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHN0YXJ0RGF0ZS5nZXQoaXRlbSkudmFsdWUhKSB8fCBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoZW5kRGF0ZS5nZXQoaXRlbSkudmFsdWUhKSB8fCBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9uZXcgRGF0ZSgyMDI0LDQsMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAvL25ldyBEYXRlKDIwMjQsNCw5KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tEdXJhdGlvbi5nZXQoaXRlbSkudmFsdWU/LnRvTnVtYmVyKCkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmNlbnRDb21wbGV0ZS5nZXQoaXRlbSkudmFsdWU/LnRvTnVtYmVyKCkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tEZXBlbmRlbmNpZXMuZ2V0KGl0ZW0pLnZhbHVlPy50b1N0cmluZygpIHx8IFwiXCJcblxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJDaGFydCBkYXRhOiBcIiwgaGVhZGVyLmNvbmNhdChkYXRhKSk7XG4gICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzZXRDaGFydERhdGEoaGVhZGVyLmNvbmNhdChkYXRhKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGRhdGFTb3VyY2UpIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybURhdGEoKTtcbiAgICAgICAgfVxuICAgIH0sIFtkYXRhU291cmNlXSk7XG5cbiAgICAgIGNvbnN0IGdhbnR0T3B0aW9ucyA9IHtcbiAgICAgICAgZ2FudHQ6IHtcbiAgICAgICAgICBjcml0aWNhbFBhdGhFbmFibGVkOiBzaG93Q3JpdGljYWxQYXRoLFxuICAgICAgICAgIC8qaW5uZXJHcmlkSG9yaXpMaW5lOiB7XG4gICAgICAgICAgICBzdHJva2U6IFwiI2ZmZTBiMlwiLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXG4gICAgICAgICAgfSwqL1xuICAgICAgICAgIGlubmVyR3JpZFRyYWNrOiB7IGZpbGw6IHJvd05vcm1hbENvbG9yIH0sXG4gICAgICAgICAgaW5uZXJHcmlkRGFya1RyYWNrOiB7IGZpbGw6IHJvd0RhcmtDb2xvciB9LFxuICAgICAgICAgIGxhYmVsU3R5bGU6IHtcbiAgICAgICAgICAgIGZvbnROYW1lOiBmb250VHlwZSxcbiAgICAgICAgICAgIGZvbnRTaXplOiBmb250U2l6ZSxcbiAgICAgICAgICAgIGNvbG9yOiBmb250Q29sb3JcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPENoYXJ0XG4gICAgICAgICAgICB3aWR0aD17JzEwMCUnfVxuICAgICAgICAgICAgaGVpZ2h0PXtnYW50dEhlaWdodH1cbiAgICAgICAgICAgIGNoYXJ0VHlwZT1cIkdhbnR0XCJcbiAgICAgICAgICAgIGxvYWRlcj17PGRpdj5Mb2FkaW5nIENoYXJ0Li4uPC9kaXY+fVxuICAgICAgICAgICAgZGF0YT17Y2hhcnREYXRhfVxuICAgICAgICAgICAgb3B0aW9ucz17Z2FudHRPcHRpb25zfVxuICAgICAgICAgICAgXG4gICAgICAgIC8+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJ1c2VMb2FkU2NyaXB0Iiwic3JjIiwib25Mb2FkIiwib25FcnJvciIsInVzZUVmZmVjdCIsImRvY3VtZW50IiwiZm91bmRTY3JpcHQiLCJxdWVyeVNlbGVjdG9yIiwiY29uY2F0IiwiZGF0YXNldCIsImxvYWRlZCIsInNjcmlwdCIsImNyZWF0ZUVsZW1lbnQiLCJvbkxvYWRXaXRoTWFya2VyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImhlYWQiLCJhcHBlbmQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwidXNlU3RhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFQTs7Ozs7O0lBTU8sU0FBU0EsYUFBYUEsQ0FDM0JDLEdBQVcsRUFDWEMsTUFBbUIsRUFDbkJDLE9BQW9CLEVBQ3BCO0lBQ0FDLEVBQUFBLGVBQVMsQ0FBQyxNQUFNO1FBQ2QsSUFBSSxDQUFDQyxRQUFRLEVBQUU7SUFDYixNQUFBLE9BQUE7SUFDRCxLQUFBOztJQUdELElBQUEsTUFBTUMsV0FBVyxHQUFHRCxRQUFRLENBQUNFLGFBQWEsQ0FDeEMsY0FBYSxDQUFNQyxNQUFFLENBQU5QLEdBQUcsRUFBQyxJQUFFLENBQUMsQ0FDdkIsQ0FBQTs7SUFHRCxJQUFBLElBQUlLLFdBQVcsS0FBQSxJQUFBLElBQVhBLFdBQVcsS0FBQSxLQUFBLENBQVMsR0FBcEIsS0FBQSxDQUFvQixHQUFwQkEsV0FBVyxDQUFFRyxPQUFPLENBQUNDLE1BQU0sRUFBRTtJQUMvQlIsTUFBQUEsTUFBTSxhQUFOQSxNQUFNLEtBQUksU0FBVixLQUFVLENBQUEsR0FBVkEsTUFBTSxFQUFJLENBQUE7SUFDVixNQUFBLE9BQUE7SUFDRCxLQUFBOztRQUdELE1BQU1TLE1BQU0sR0FBR0wsV0FBVyxJQUFJRCxRQUFRLENBQUNPLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQTs7UUFHOUQsSUFBSSxDQUFDTixXQUFXLEVBQUU7VUFDaEJLLE1BQU0sQ0FBQ1YsR0FBRyxHQUFHQSxHQUFHLENBQUE7SUFDakIsS0FBQTs7UUFHRCxNQUFNWSxnQkFBZ0IsR0FBR0EsTUFBTTtJQUM3QkYsTUFBQUEsTUFBTSxDQUFDRixPQUFPLENBQUNDLE1BQU0sR0FBRyxHQUFHLENBQUE7SUFDM0JSLE1BQUFBLE1BQU0sYUFBTkEsTUFBTSxLQUFJLFNBQVYsS0FBVSxDQUFBLEdBQVZBLE1BQU0sRUFBSSxDQUFBO0lBQ1gsS0FBQSxDQUFBO0lBRURTLElBQUFBLE1BQU0sQ0FBQ0csZ0JBQWdCLENBQUMsTUFBTSxFQUFFRCxnQkFBZ0IsQ0FBQyxDQUFBO0lBRWpELElBQUEsSUFBSVYsT0FBTyxFQUFFO0lBQ1hRLE1BQUFBLE1BQU0sQ0FBQ0csZ0JBQWdCLENBQUMsT0FBTyxFQUFFWCxPQUFPLENBQUMsQ0FBQTtJQUMxQyxLQUFBOztRQUdELElBQUksQ0FBQ0csV0FBVyxFQUFFO0lBQ2hCRCxNQUFBQSxRQUFRLENBQUNVLElBQUksQ0FBQ0MsTUFBTSxDQUFDTCxNQUFNLENBQUMsQ0FBQTtJQUM3QixLQUFBO0lBRUQsSUFBQSxPQUFPLE1BQU07SUFDWEEsTUFBQUEsTUFBTSxDQUFDTSxtQkFBbUIsQ0FBQyxNQUFNLEVBQUVKLGdCQUFnQixDQUFDLENBQUE7SUFFcEQsTUFBQSxJQUFJVixPQUFPLEVBQUU7SUFDWFEsUUFBQUEsTUFBTSxDQUFDTSxtQkFBbUIsQ0FBQyxPQUFPLEVBQUVkLE9BQU8sQ0FBQyxDQUFBO0lBQzdDLE9BQUE7SUFDRixLQUFBLENBQUE7SUFDRixHQUFBLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDUCxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDbkRlLFNBQUEsY0FBYyxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBZ0MsRUFBQTtRQUV4USxNQUFNLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxHQUFHZSxjQUFRLENBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBRTlEZCxlQUFTLENBQUMsTUFBSztZQUNYLE1BQU0sYUFBYSxHQUFHLE1BQUs7SUFDdkIsWUFBQSxNQUFNLE1BQU0sR0FBb0Q7SUFDNUQsZ0JBQUE7d0JBQ0UsU0FBUzt3QkFDVCxXQUFXO3dCQUNYLFVBQVU7d0JBQ1YsWUFBWTt3QkFDWixVQUFVO3dCQUNWLFVBQVU7d0JBQ1Ysa0JBQWtCO3dCQUNsQixjQUFjO0lBQ2YsaUJBQUE7aUJBQ0YsQ0FBQztnQkFFSixJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLFdBQVcsSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFO29CQUNyRSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3pDLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBZ0IsS0FBSztJQUNwRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBa0JJOzt3QkFFSixPQUFPO0lBQ0gsd0JBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBRSxRQUFRLEVBQUUsS0FBSSxFQUFFO0lBQ3hDLHdCQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUUsUUFBUSxFQUFFLEtBQUksY0FBYztJQUN0RCx3QkFBQSxDQUFBLENBQUEsRUFBQSxHQUFBLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFFLFFBQVEsRUFBRSxLQUFJLGtCQUFrQjtJQUM5RCx3QkFBQSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO0lBQ2xELHdCQUFBLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBTSxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUU7OztJQUdoRCx3QkFBQSxDQUFBLENBQUEsRUFBQSxHQUFBLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFFLFFBQVEsRUFBRSxLQUFJLENBQUM7SUFDN0Msd0JBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBRSxRQUFRLEVBQUUsS0FBSSxDQUFDO0lBQ2hELHdCQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBRSxRQUFRLEVBQUUsS0FBSSxFQUFFO3lCQUVyRCxDQUFDO0lBQ04saUJBQUMsQ0FBQyxDQUFDO0lBSUgsZ0JBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUlsRCxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLGFBQUE7SUFDTCxTQUFDLENBQUM7SUFFRixRQUFBLElBQUksVUFBVSxFQUFFO0lBQ1osWUFBQSxhQUFhLEVBQUUsQ0FBQztJQUNuQixTQUFBO0lBQ0wsS0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUVmLElBQUEsTUFBTSxZQUFZLEdBQUc7SUFDbkIsUUFBQSxLQUFLLEVBQUU7SUFDTCxZQUFBLG1CQUFtQixFQUFFLGdCQUFnQjtJQUNyQzs7O0lBR0k7SUFDSixZQUFBLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUU7SUFDeEMsWUFBQSxrQkFBa0IsRUFBRSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUU7SUFDMUMsWUFBQSxVQUFVLEVBQUU7SUFDVixnQkFBQSxRQUFRLEVBQUUsUUFBUTtJQUNsQixnQkFBQSxRQUFRLEVBQUUsUUFBUTtJQUNsQixnQkFBQSxLQUFLLEVBQUUsU0FBUztJQUNqQixhQUFBO0lBQ0YsU0FBQTtTQUNGLENBQUM7SUFFSixJQUFBLFFBQ0lRLG1CQUFBLENBQUMsS0FBSyxFQUFBLEVBQ0YsS0FBSyxFQUFFLE1BQU0sRUFDYixNQUFNLEVBQUUsV0FBVyxFQUNuQixTQUFTLEVBQUMsT0FBTyxFQUNqQixNQUFNLEVBQUVBLG1CQUEyQixDQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsa0JBQUEsQ0FBQSxFQUNuQyxJQUFJLEVBQUUsU0FBUyxFQUNmLE9BQU8sRUFBRSxZQUFZLEVBQUEsQ0FFdkIsRUFDSjtJQUNOOzs7Ozs7Ozs7OyJ9
