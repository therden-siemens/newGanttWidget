
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
        return (React.createElement(Chart, { width: '100%', height: ganttHeight, chartType: "Gantt", loader: React.createElement("div", null, "Loading Chart..."), data: chartData, options: ganttOptions }));
    }

    exports.NewGanttWidget = NewGanttWidget;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV3R2FudHRXaWRnZXQuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9yZWFjdC1nb29nbGUtY2hhcnRzL2Rpc3QvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9zcmMvTmV3R2FudHRXaWRnZXQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5cbi8qKlxuICogSG9vayB0byBsb2FkIGV4dGVybmFsIHNjcmlwdC5cbiAqIEBwYXJhbSBzcmMgLSBTb3VyY2UgdXJsIHRvIGxvYWQuXG4gKiBAcGFyYW0gb25Mb2FkIC0gU3VjY2VzcyBjYWxsYmFjay5cbiAqIEBwYXJhbSBvbkVycm9yIC0gRXJyb3IgY2FsbGJhY2suXG4gKi8gZnVuY3Rpb24gdXNlTG9hZFNjcmlwdChzcmMsIG9uTG9hZCwgb25FcnJvcikge1xuICAgIHVzZUVmZmVjdCgoKT0+e1xuICAgICAgICBpZiAoIWRvY3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gRmluZCBzY3JpcHQgdGFnIHdpdGggc2FtZSBzcmMgaW4gRE9NLlxuICAgICAgICBjb25zdCBmb3VuZFNjcmlwdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NjcmlwdFtzcmM9XCInLmNvbmNhdChzcmMsICdcIl0nKSk7XG4gICAgICAgIC8vIENhbGwgb25Mb2FkIGlmIHNjcmlwdCBtYXJrZWQgYXMgbG9hZGVkLlxuICAgICAgICBpZiAoZm91bmRTY3JpcHQgPT09IG51bGwgfHwgZm91bmRTY3JpcHQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGZvdW5kU2NyaXB0LmRhdGFzZXQubG9hZGVkKSB7XG4gICAgICAgICAgICBvbkxvYWQgPT09IG51bGwgfHwgb25Mb2FkID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvbkxvYWQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBDcmVhdGUgb3IgZ2V0IGV4aXN0ZWQgdGFnLlxuICAgICAgICBjb25zdCBzY3JpcHQgPSBmb3VuZFNjcmlwdCB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgICAgICAvLyBTZXQgc3JjIGlmIG5vIHNjcmlwdCB3YXMgZm91bmQuXG4gICAgICAgIGlmICghZm91bmRTY3JpcHQpIHtcbiAgICAgICAgICAgIHNjcmlwdC5zcmMgPSBzcmM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWFyayBzY3JpcHQgYXMgbG9hZGVkIG9uIGxvYWQgZXZlbnQuXG4gICAgICAgIGNvbnN0IG9uTG9hZFdpdGhNYXJrZXIgPSAoKT0+e1xuICAgICAgICAgICAgc2NyaXB0LmRhdGFzZXQubG9hZGVkID0gXCIxXCI7XG4gICAgICAgICAgICBvbkxvYWQgPT09IG51bGwgfHwgb25Mb2FkID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvbkxvYWQoKTtcbiAgICAgICAgfTtcbiAgICAgICAgc2NyaXB0LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIG9uTG9hZFdpdGhNYXJrZXIpO1xuICAgICAgICBpZiAob25FcnJvcikge1xuICAgICAgICAgICAgc2NyaXB0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBvbkVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgdG8gRE9NIGlmIG5vdCB5ZXQgYWRkZWQuXG4gICAgICAgIGlmICghZm91bmRTY3JpcHQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kKHNjcmlwdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgpPT57XG4gICAgICAgICAgICBzY3JpcHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgb25Mb2FkV2l0aE1hcmtlcik7XG4gICAgICAgICAgICBpZiAob25FcnJvcikge1xuICAgICAgICAgICAgICAgIHNjcmlwdC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgb25FcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSwgW10pO1xufVxuXG4vKipcbiAqIEhvb2sgdG8gbG9hZCBHb29nbGUgQ2hhcnRzIEpTIEFQSS5cbiAqIEBwYXJhbSBwYXJhbXMgLSBMb2FkIHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0gW3BhcmFtcy5jaGFydFZlcnNpb25dIC0gQ2hhcnQgdmVyc2lvbiB0byBsb2FkLlxuICogQHBhcmFtIFtwYXJhbXMuY2hhcnRQYWNrYWdlc10gLSBQYWNrYWdlcyB0byBsb2FkLlxuICogQHBhcmFtIFtwYXJhbXMuY2hhcnRMYW5ndWFnZV0gLSBMYW5ndWFnZXMgdG8gbG9hZC5cbiAqIEBwYXJhbSBbcGFyYW1zLm1hcHNBcGlLZXldIC0gR29vZ2xlIE1hcHMgYXBpIGtleS5cbiAqIEByZXR1cm5zXG4gKi8gZnVuY3Rpb24gdXNlTG9hZEdvb2dsZUNoYXJ0cyhwYXJhbSkge1xuICAgIGxldCB7IGNoYXJ0VmVyc2lvbiA9XCJjdXJyZW50XCIgLCBjaGFydFBhY2thZ2VzID1bXG4gICAgICAgIFwiY29yZWNoYXJ0XCIsXG4gICAgICAgIFwiY29udHJvbHNcIlxuICAgIF0gLCBjaGFydExhbmd1YWdlID1cImVuXCIgLCBtYXBzQXBpS2V5ICB9ID0gcGFyYW07XG4gICAgY29uc3QgW2dvb2dsZUNoYXJ0cywgc2V0R29vZ2xlQ2hhcnRzXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtmYWlsZWQsIHNldEZhaWxlZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgdXNlTG9hZFNjcmlwdChcImh0dHBzOi8vd3d3LmdzdGF0aWMuY29tL2NoYXJ0cy9sb2FkZXIuanNcIiwgKCk9PntcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBHZXR0aW5nIG9iamVjdCBmcm9tIGdsb2JhbCBuYW1lc3BhY2UuXG4gICAgICAgIGNvbnN0IGdvb2dsZSA9IHdpbmRvdyA9PT0gbnVsbCB8fCB3aW5kb3cgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHdpbmRvdy5nb29nbGU7XG4gICAgICAgIGlmICghZ29vZ2xlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZ29vZ2xlLmNoYXJ0cy5sb2FkKGNoYXJ0VmVyc2lvbiwge1xuICAgICAgICAgICAgcGFja2FnZXM6IGNoYXJ0UGFja2FnZXMsXG4gICAgICAgICAgICBsYW5ndWFnZTogY2hhcnRMYW5ndWFnZSxcbiAgICAgICAgICAgIG1hcHNBcGlLZXlcbiAgICAgICAgfSk7XG4gICAgICAgIGdvb2dsZS5jaGFydHMuc2V0T25Mb2FkQ2FsbGJhY2soKCk9PntcbiAgICAgICAgICAgIHNldEdvb2dsZUNoYXJ0cyhnb29nbGUpO1xuICAgICAgICB9KTtcbiAgICB9LCAoKT0+e1xuICAgICAgICBzZXRGYWlsZWQodHJ1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgZ29vZ2xlQ2hhcnRzLFxuICAgICAgICBmYWlsZWRcbiAgICBdO1xufVxuLyoqXG4gKiBXcmFwcGVyIGFyb3VuZCB1c2VMb2FkR29vZ2xlQ2hhcnRzIHRvIHVzZSBpbiBsZWdhY3kgY29tcG9uZW50cy5cbiAqLyBmdW5jdGlvbiBMb2FkR29vZ2xlQ2hhcnRzKHBhcmFtKSB7XG4gICAgbGV0IHsgb25Mb2FkICwgb25FcnJvciAsIC4uLnBhcmFtcyB9ID0gcGFyYW07XG4gICAgY29uc3QgW2dvb2dsZUNoYXJ0cywgZmFpbGVkXSA9IHVzZUxvYWRHb29nbGVDaGFydHMocGFyYW1zKTtcbiAgICB1c2VFZmZlY3QoKCk9PntcbiAgICAgICAgaWYgKGdvb2dsZUNoYXJ0cyAmJiBvbkxvYWQpIHtcbiAgICAgICAgICAgIG9uTG9hZChnb29nbGVDaGFydHMpO1xuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICBnb29nbGVDaGFydHNcbiAgICBdKTtcbiAgICB1c2VFZmZlY3QoKCk9PntcbiAgICAgICAgaWYgKGZhaWxlZCAmJiBvbkVycm9yKSB7XG4gICAgICAgICAgICBvbkVycm9yKCk7XG4gICAgICAgIH1cbiAgICB9LCBbXG4gICAgICAgIGZhaWxlZFxuICAgIF0pO1xuICAgIHJldHVybiBudWxsO1xufVxuXG5jb25zdCBjaGFydERlZmF1bHRQcm9wcyA9IHtcbiAgICAvLyA8REVQUkVDQVRFRF9QUk9QUz5cbiAgICBsZWdlbmRfdG9nZ2xlOiBmYWxzZSxcbiAgICAvLyA8L0RFUFJFQ0FURURfUFJPUFM+XG4gICAgb3B0aW9uczoge30sXG4gICAgbGVnZW5kVG9nZ2xlOiBmYWxzZSxcbiAgICBnZXRDaGFydFdyYXBwZXI6ICgpPT57fSxcbiAgICBzcHJlYWRTaGVldFF1ZXJ5UGFyYW1ldGVyczoge1xuICAgICAgICBoZWFkZXJzOiAxLFxuICAgICAgICBnaWQ6IDFcbiAgICB9LFxuICAgIHJvb3RQcm9wczoge30sXG4gICAgY2hhcnRXcmFwcGVyUGFyYW1zOiB7fVxufTtcblxubGV0IHVuaXF1ZUlEID0gMDtcbmNvbnN0IGdlbmVyYXRlVW5pcXVlSUQgPSAoKT0+e1xuICAgIHVuaXF1ZUlEICs9IDE7XG4gICAgcmV0dXJuIFwicmVhY3Rnb29nbGVncmFwaC1cIi5jb25jYXQodW5pcXVlSUQpO1xufTtcblxuY29uc3QgREVGQVVMVF9DSEFSVF9DT0xPUlMgPSBbXG4gICAgXCIjMzM2NkNDXCIsXG4gICAgXCIjREMzOTEyXCIsXG4gICAgXCIjRkY5OTAwXCIsXG4gICAgXCIjMTA5NjE4XCIsXG4gICAgXCIjOTkwMDk5XCIsXG4gICAgXCIjM0IzRUFDXCIsXG4gICAgXCIjMDA5OUM2XCIsXG4gICAgXCIjREQ0NDc3XCIsXG4gICAgXCIjNjZBQTAwXCIsXG4gICAgXCIjQjgyRTJFXCIsXG4gICAgXCIjMzE2Mzk1XCIsXG4gICAgXCIjOTk0NDk5XCIsXG4gICAgXCIjMjJBQTk5XCIsXG4gICAgXCIjQUFBQTExXCIsXG4gICAgXCIjNjYzM0NDXCIsXG4gICAgXCIjRTY3MzAwXCIsXG4gICAgXCIjOEIwNzA3XCIsXG4gICAgXCIjMzI5MjYyXCIsXG4gICAgXCIjNTU3NEE2XCIsXG4gICAgXCIjM0IzRUFDXCJcbl07XG5cbmNvbnN0IGxvYWREYXRhVGFibGVGcm9tU3ByZWFkU2hlZXQgPSBhc3luYyBmdW5jdGlvbihnb29nbGVWaXosIHNwcmVhZFNoZWV0VXJsKSB7XG4gICAgbGV0IHVybFBhcmFtcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzJdIDoge307XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBcIlwiLmNvbmNhdCh1cmxQYXJhbXMuaGVhZGVycyA/IFwiaGVhZGVycz1cIi5jb25jYXQodXJsUGFyYW1zLmhlYWRlcnMpIDogXCJoZWFkZXJzPTBcIik7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gXCJcIi5jb25jYXQodXJsUGFyYW1zLnF1ZXJ5ID8gXCImdHE9XCIuY29uY2F0KGVuY29kZVVSSUNvbXBvbmVudCh1cmxQYXJhbXMucXVlcnkpKSA6IFwiXCIpO1xuICAgICAgICBjb25zdCBnaWQgPSBcIlwiLmNvbmNhdCh1cmxQYXJhbXMuZ2lkID8gXCImZ2lkPVwiLmNvbmNhdCh1cmxQYXJhbXMuZ2lkKSA6IFwiXCIpO1xuICAgICAgICBjb25zdCBzaGVldCA9IFwiXCIuY29uY2F0KHVybFBhcmFtcy5zaGVldCA/IFwiJnNoZWV0PVwiLmNvbmNhdCh1cmxQYXJhbXMuc2hlZXQpIDogXCJcIik7XG4gICAgICAgIGNvbnN0IGFjY2Vzc190b2tlbiA9IFwiXCIuY29uY2F0KHVybFBhcmFtcy5hY2Nlc3NfdG9rZW4gPyBcIiZhY2Nlc3NfdG9rZW49XCIuY29uY2F0KHVybFBhcmFtcy5hY2Nlc3NfdG9rZW4pIDogXCJcIik7XG4gICAgICAgIGNvbnN0IHVybFF1ZXJ5U3RyaW5nID0gXCJcIi5jb25jYXQoaGVhZGVycykuY29uY2F0KGdpZCkuY29uY2F0KHNoZWV0KS5jb25jYXQocXVlcnlTdHJpbmcpLmNvbmNhdChhY2Nlc3NfdG9rZW4pO1xuICAgICAgICBjb25zdCB1cmxUb1NwcmVhZFNoZWV0ID0gXCJcIi5jb25jYXQoc3ByZWFkU2hlZXRVcmwsIFwiL2d2aXovdHE/XCIpLmNvbmNhdCh1cmxRdWVyeVN0cmluZyk7IC8vJnRxPSR7cXVlcnlTdHJpbmd9YDtcbiAgICAgICAgY29uc3QgcXVlcnkgPSBuZXcgZ29vZ2xlVml6LnZpc3VhbGl6YXRpb24uUXVlcnkodXJsVG9TcHJlYWRTaGVldCk7XG4gICAgICAgIHF1ZXJ5LnNlbmQoKHJlc3BvbnNlKT0+e1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmlzRXJyb3IoKSkge1xuICAgICAgICAgICAgICAgIHJlamVjdChcIkVycm9yIGluIHF1ZXJ5OiAgXCIuY29uY2F0KHJlc3BvbnNlLmdldE1lc3NhZ2UoKSwgXCIgXCIpLmNvbmNhdChyZXNwb25zZS5nZXREZXRhaWxlZE1lc3NhZ2UoKSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlLmdldERhdGFUYWJsZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5jb25zdCB7IFByb3ZpZGVyICwgQ29uc3VtZXIgIH0gPSAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUNvbnRleHQoY2hhcnREZWZhdWx0UHJvcHMpO1xuY29uc3QgQ29udGV4dFByb3ZpZGVyID0gKHBhcmFtKT0+e1xuICAgIGxldCB7IGNoaWxkcmVuICwgdmFsdWUgIH0gPSBwYXJhbTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFByb3ZpZGVyLCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0sIGNoaWxkcmVuKTtcbn07XG5jb25zdCBDb250ZXh0Q29uc3VtZXIgPSAocGFyYW0pPT57XG4gICAgbGV0IHsgcmVuZGVyICB9ID0gcGFyYW07XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChDb25zdW1lciwgbnVsbCwgKGNvbnRleHQpPT57XG4gICAgICAgIHJldHVybiByZW5kZXIoY29udGV4dCk7XG4gICAgfSk7XG59O1xuXG5jb25zdCBHUkFZX0NPTE9SID0gXCIjQ0NDQ0NDXCI7XG5jbGFzcyBHb29nbGVDaGFydERhdGFUYWJsZUlubmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5kcmF3KHRoaXMucHJvcHMpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubGVnZW5kX3RvZ2dsZSB8fCB0aGlzLnByb3BzLmxlZ2VuZFRvZ2dsZSkge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5Ub0xlZ2VuZFRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBjb25zdCB7IGdvb2dsZSAsIGdvb2dsZUNoYXJ0V3JhcHBlciAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMub25SZXNpemUpO1xuICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMucmVtb3ZlQWxsTGlzdGVuZXJzKGdvb2dsZUNoYXJ0V3JhcHBlcik7XG4gICAgICAgIGlmIChnb29nbGVDaGFydFdyYXBwZXIuZ2V0Q2hhcnRUeXBlKCkgPT09IFwiVGltZWxpbmVcIikge1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldENoYXJ0KCkgJiYgZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldENoYXJ0KCkuY2xlYXJDaGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5kcmF3KHRoaXMucHJvcHMpO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBoaWRkZW5Db2x1bW5zOiBbXVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmxpc3RlblRvTGVnZW5kVG9nZ2xlID0gKCk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgZ29vZ2xlICwgZ29vZ2xlQ2hhcnRXcmFwcGVyICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGdvb2dsZS52aXN1YWxpemF0aW9uLmV2ZW50cy5hZGRMaXN0ZW5lcihnb29nbGVDaGFydFdyYXBwZXIsIFwic2VsZWN0XCIsICgpPT57XG4gICAgICAgICAgICAgICAgY29uc3QgY2hhcnQgPSBnb29nbGVDaGFydFdyYXBwZXIuZ2V0Q2hhcnQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBjaGFydC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhVGFibGUgPSBnb29nbGVDaGFydFdyYXBwZXIuZ2V0RGF0YVRhYmxlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGlvbi5sZW5ndGggPT09IDAgfHwgLy8gV2Ugd2FudCB0byBsaXN0ZW4gdG8gd2hlbiBhIHdob2xlIHJvdyBpcyBzZWxlY3RlZC4gVGhpcyBpcyB0aGUgY2FzZSBvbmx5IHdoZW4gcm93ID09PSBudWxsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uWzBdLnJvdyB8fCAhZGF0YVRhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgY29sdW1uSW5kZXggPSBzZWxlY3Rpb25bMF0uY29sdW1uO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbklEID0gdGhpcy5nZXRDb2x1bW5JRChkYXRhVGFibGUsIGNvbHVtbkluZGV4KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5oaWRkZW5Db2x1bW5zLmluY2x1ZGVzKGNvbHVtbklEKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKChzdGF0ZSk9Pih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlkZGVuQ29sdW1uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5oaWRkZW5Db2x1bW5zLmZpbHRlcigoY29sSUQpPT5jb2xJRCAhPT0gY29sdW1uSUQpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSgoc3RhdGUpPT4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZGRlbkNvbHVtbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuaGlkZGVuQ29sdW1ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uSURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYXBwbHlGb3JtYXR0ZXJzID0gKGRhdGFUYWJsZSwgZm9ybWF0dGVycyk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgZ29vZ2xlICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGZvciAobGV0IGZvcm1hdHRlciBvZiBmb3JtYXR0ZXJzKXtcbiAgICAgICAgICAgICAgICBzd2l0Y2goZm9ybWF0dGVyLnR5cGUpe1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQXJyb3dGb3JtYXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2aXpGb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQXJyb3dGb3JtYXQoZm9ybWF0dGVyLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpekZvcm1hdHRlci5mb3JtYXQoZGF0YVRhYmxlLCBmb3JtYXR0ZXIuY29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkJhckZvcm1hdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZpekZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5CYXJGb3JtYXQoZm9ybWF0dGVyLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpekZvcm1hdHRlci5mb3JtYXQoZGF0YVRhYmxlLCBmb3JtYXR0ZXIuY29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkNvbG9yRm9ybWF0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgdml6Rm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbG9yRm9ybWF0KGZvcm1hdHRlci5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHJhbmdlcyAgfSA9IGZvcm1hdHRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCByYW5nZSBvZiByYW5nZXMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXpGb3JtYXR0ZXIuYWRkUmFuZ2UoLi4ucmFuZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXpGb3JtYXR0ZXIuZm9ybWF0KGRhdGFUYWJsZSwgZm9ybWF0dGVyLmNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJEYXRlRm9ybWF0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgdml6Rm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGVGb3JtYXQoZm9ybWF0dGVyLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpekZvcm1hdHRlci5mb3JtYXQoZGF0YVRhYmxlLCBmb3JtYXR0ZXIuY29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk51bWJlckZvcm1hdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZpekZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5OdW1iZXJGb3JtYXQoZm9ybWF0dGVyLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpekZvcm1hdHRlci5mb3JtYXQoZGF0YVRhYmxlLCBmb3JtYXR0ZXIuY29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlBhdHRlcm5Gb3JtYXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2aXpGb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uUGF0dGVybkZvcm1hdChmb3JtYXR0ZXIub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdml6Rm9ybWF0dGVyLmZvcm1hdChkYXRhVGFibGUsIGZvcm1hdHRlci5jb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRDb2x1bW5JRCA9IChkYXRhVGFibGUsIGNvbHVtbkluZGV4KT0+e1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFUYWJsZS5nZXRDb2x1bW5JZChjb2x1bW5JbmRleCkgfHwgZGF0YVRhYmxlLmdldENvbHVtbkxhYmVsKGNvbHVtbkluZGV4KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5kcmF3ID0gYXN5bmMgKHBhcmFtKT0+e1xuICAgICAgICAgICAgbGV0IHsgZGF0YSAsIGRpZmZkYXRhICwgcm93cyAsIGNvbHVtbnMgLCBvcHRpb25zICwgbGVnZW5kX3RvZ2dsZSAsIGxlZ2VuZFRvZ2dsZSAsIGNoYXJ0VHlwZSAsIGZvcm1hdHRlcnMgLCBzcHJlYWRTaGVldFVybCAsIHNwcmVhZFNoZWV0UXVlcnlQYXJhbWV0ZXJzICB9ID0gcGFyYW07XG4gICAgICAgICAgICBjb25zdCB7IGdvb2dsZSAsIGdvb2dsZUNoYXJ0V3JhcHBlciAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBsZXQgZGF0YVRhYmxlO1xuICAgICAgICAgICAgbGV0IGNoYXJ0RGlmZiA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZGlmZmRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGREYXRhID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkaWZmZGF0YS5vbGQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0RhdGEgPSBnb29nbGUudmlzdWFsaXphdGlvbi5hcnJheVRvRGF0YVRhYmxlKGRpZmZkYXRhLm5ldyk7XG4gICAgICAgICAgICAgICAgY2hhcnREaWZmID0gZ29vZ2xlLnZpc3VhbGl6YXRpb25bY2hhcnRUeXBlXS5wcm90b3R5cGUuY29tcHV0ZURpZmYob2xkRGF0YSwgbmV3RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFUYWJsZSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVRhYmxlID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZShkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJvd3MgJiYgY29sdW1ucykge1xuICAgICAgICAgICAgICAgIGRhdGFUYWJsZSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoW1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zLFxuICAgICAgICAgICAgICAgICAgICAuLi5yb3dzXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNwcmVhZFNoZWV0VXJsKSB7XG4gICAgICAgICAgICAgICAgZGF0YVRhYmxlID0gYXdhaXQgbG9hZERhdGFUYWJsZUZyb21TcHJlYWRTaGVldChnb29nbGUsIHNwcmVhZFNoZWV0VXJsLCBzcHJlYWRTaGVldFF1ZXJ5UGFyYW1ldGVycyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRhdGFUYWJsZSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY29sdW1uQ291bnQgPSBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7XG4gICAgICAgICAgICBjb25zdCB2aWV3Q29sdW1ucyA9IEFycmF5KGNvbHVtbkNvdW50KS5maWxsKDApLm1hcCgoYywgaSk9PntcbiAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JRCA9IHRoaXMuZ2V0Q29sdW1uSUQoZGF0YVRhYmxlLCBpKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5oaWRkZW5Db2x1bW5zLmluY2x1ZGVzKGNvbHVtbklEKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGRhdGFUYWJsZS5nZXRDb2x1bW5MYWJlbChpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGRhdGFUYWJsZS5nZXRDb2x1bW5UeXBlKGkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsYzogKCk9Pm51bGxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IGNoYXJ0ID0gZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldENoYXJ0KCk7XG4gICAgICAgICAgICBpZiAoZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldENoYXJ0VHlwZSgpID09PSBcIlRpbWVsaW5lXCIpIHtcbiAgICAgICAgICAgICAgICBjaGFydCAmJiBjaGFydC5jbGVhckNoYXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuc2V0Q2hhcnRUeXBlKGNoYXJ0VHlwZSk7XG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuc2V0T3B0aW9ucyhvcHRpb25zIHx8IHt9KTtcbiAgICAgICAgICAgIGNvbnN0IHZpZXdUYWJsZSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVmlldyhkYXRhVGFibGUpO1xuICAgICAgICAgICAgdmlld1RhYmxlLnNldENvbHVtbnModmlld0NvbHVtbnMpO1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldERhdGFUYWJsZSh2aWV3VGFibGUpO1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLmRyYXcoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmdvb2dsZUNoYXJ0RGFzaGJvYXJkICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nb29nbGVDaGFydERhc2hib2FyZC5kcmF3KGRhdGFUYWJsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2hhcnREaWZmKSB7XG4gICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldERhdGFUYWJsZShjaGFydERpZmYpO1xuICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5kcmF3KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZm9ybWF0dGVycykge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlGb3JtYXR0ZXJzKGRhdGFUYWJsZSwgZm9ybWF0dGVycyk7XG4gICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldERhdGFUYWJsZShkYXRhVGFibGUpO1xuICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlci5kcmF3KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGVnZW5kVG9nZ2xlID09PSB0cnVlIHx8IGxlZ2VuZF90b2dnbGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyYXlPdXRIaWRkZW5Db2x1bW5zKHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdyYXlPdXRIaWRkZW5Db2x1bW5zID0gKHBhcmFtKT0+e1xuICAgICAgICAgICAgbGV0IHsgb3B0aW9ucyAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgY29uc3QgeyBnb29nbGVDaGFydFdyYXBwZXIgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgZGF0YVRhYmxlID0gZ29vZ2xlQ2hhcnRXcmFwcGVyLmdldERhdGFUYWJsZSgpO1xuICAgICAgICAgICAgaWYgKCFkYXRhVGFibGUpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGNvbHVtbkNvdW50ID0gZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpO1xuICAgICAgICAgICAgY29uc3QgaGFzQUhpZGRlbkNvbHVtbiA9IHRoaXMuc3RhdGUuaGlkZGVuQ29sdW1ucy5sZW5ndGggPiAwO1xuICAgICAgICAgICAgaWYgKGhhc0FIaWRkZW5Db2x1bW4gPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBjb2xvcnMgPSBBcnJheS5mcm9tKHtcbiAgICAgICAgICAgICAgICBsZW5ndGg6IGNvbHVtbkNvdW50IC0gMVxuICAgICAgICAgICAgfSkubWFwKChkb250Y2FyZSwgaSk9PntcbiAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JRCA9IHRoaXMuZ2V0Q29sdW1uSUQoZGF0YVRhYmxlLCBpICsgMSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGlkZGVuQ29sdW1ucy5pbmNsdWRlcyhjb2x1bW5JRCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEdSQVlfQ09MT1I7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zICYmIG9wdGlvbnMuY29sb3JzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmNvbG9yc1tpXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gREVGQVVMVF9DSEFSVF9DT0xPUlNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuc2V0T3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBjb2xvcnNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLmRyYXcoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vblJlc2l6ZSA9ICgpPT57XG4gICAgICAgICAgICBjb25zdCB7IGdvb2dsZUNoYXJ0V3JhcHBlciAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXIuZHJhdygpO1xuICAgICAgICB9O1xuICAgIH1cbn1cbmNsYXNzIEdvb2dsZUNoYXJ0RGF0YVRhYmxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb21wb25lbnREaWRNb3VudCgpIHt9XG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7fVxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgZ29vZ2xlICwgZ29vZ2xlQ2hhcnRXcmFwcGVyICwgZ29vZ2xlQ2hhcnREYXNoYm9hcmQgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KENvbnRleHRDb25zdW1lciwge1xuICAgICAgICAgICAgcmVuZGVyOiAocHJvcHMpPT57XG4gICAgICAgICAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChHb29nbGVDaGFydERhdGFUYWJsZUlubmVyLCBPYmplY3QuYXNzaWduKHt9LCBwcm9wcywge1xuICAgICAgICAgICAgICAgICAgICBnb29nbGU6IGdvb2dsZSxcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyOiBnb29nbGVDaGFydFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0RGFzaGJvYXJkOiBnb29nbGVDaGFydERhc2hib2FyZFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jbGFzcyBHb29nbGVDaGFydEV2ZW50cyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGxpc3RlblRvRXZlbnRzKHBhcmFtKSB7XG4gICAgICAgIGxldCB7IGNoYXJ0RXZlbnRzICwgZ29vZ2xlICwgZ29vZ2xlQ2hhcnRXcmFwcGVyICB9ID0gcGFyYW07XG4gICAgICAgIGlmICghY2hhcnRFdmVudHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMucmVtb3ZlQWxsTGlzdGVuZXJzKGdvb2dsZUNoYXJ0V3JhcHBlcik7XG4gICAgICAgIGZvciAobGV0IGV2ZW50IG9mIGNoYXJ0RXZlbnRzKXtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICBjb25zdCB7IGV2ZW50TmFtZSAsIGNhbGxiYWNrICB9ID0gZXZlbnQ7XG4gICAgICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMuYWRkTGlzdGVuZXIoZ29vZ2xlQ2hhcnRXcmFwcGVyLCBldmVudE5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKXtcbiAgICAgICAgICAgICAgICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soe1xuICAgICAgICAgICAgICAgICAgICBjaGFydFdyYXBwZXI6IGdvb2dsZUNoYXJ0V3JhcHBlcixcbiAgICAgICAgICAgICAgICAgICAgcHJvcHM6IF90aGlzLnByb3BzLFxuICAgICAgICAgICAgICAgICAgICBnb29nbGU6IGdvb2dsZSxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBcmdzOiBhcmdzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgY29uc3QgeyBnb29nbGUgLCBnb29nbGVDaGFydFdyYXBwZXIgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICB0aGlzLmxpc3RlblRvRXZlbnRzKHtcbiAgICAgICAgICAgIGNoYXJ0RXZlbnRzOiAoKHJlZiA9IHRoaXMucHJvcHNGcm9tQ29udGV4dCkgPT09IG51bGwgfHwgcmVmID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZWYuY2hhcnRFdmVudHMpIHx8IG51bGwsXG4gICAgICAgICAgICBnb29nbGUsXG4gICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXJcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5wcm9wcztcbiAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChDb250ZXh0Q29uc3VtZXIsIHtcbiAgICAgICAgICAgIHJlbmRlcjogKHByb3BzRnJvbUNvbnRleHQpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wc0Zyb21Db250ZXh0ID0gcHJvcHNGcm9tQ29udGV4dDtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHByb3BzKXtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnByb3BzRnJvbUNvbnRleHQgPSBudWxsO1xuICAgIH1cbn1cblxubGV0IGNvbnRyb2xDb3VudGVyID0gMDtcbmNsYXNzIEdvb2dsZUNoYXJ0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgY29uc3QgeyBvcHRpb25zICwgZ29vZ2xlICwgY2hhcnRUeXBlICwgY2hhcnRXcmFwcGVyUGFyYW1zICwgdG9vbGJhckl0ZW1zICwgZ2V0Q2hhcnRFZGl0b3IgLCBnZXRDaGFydFdyYXBwZXIgLCAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IGNoYXJ0Q29uZmlnID0ge1xuICAgICAgICAgICAgY2hhcnRUeXBlLFxuICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgIGNvbnRhaW5lcklkOiB0aGlzLmdldEdyYXBoSUQoKSxcbiAgICAgICAgICAgIC4uLmNoYXJ0V3JhcHBlclBhcmFtc1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBnb29nbGVDaGFydFdyYXBwZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ2hhcnRXcmFwcGVyKGNoYXJ0Q29uZmlnKTtcbiAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLnNldE9wdGlvbnMob3B0aW9ucyB8fCB7fSk7XG4gICAgICAgIGlmIChnZXRDaGFydFdyYXBwZXIpIHtcbiAgICAgICAgICAgIGdldENoYXJ0V3JhcHBlcihnb29nbGVDaGFydFdyYXBwZXIsIGdvb2dsZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZ29vZ2xlQ2hhcnREYXNoYm9hcmQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGFzaGJvYXJkKHRoaXMuZGFzaGJvYXJkX3JlZik7XG4gICAgICAgIGNvbnN0IGdvb2dsZUNoYXJ0Q29udHJvbHMgPSB0aGlzLmFkZENvbnRyb2xzKGdvb2dsZUNoYXJ0V3JhcHBlciwgZ29vZ2xlQ2hhcnREYXNoYm9hcmQpO1xuICAgICAgICBpZiAodG9vbGJhckl0ZW1zKSB7XG4gICAgICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5kcmF3VG9vbGJhcih0aGlzLnRvb2xiYXJfcmVmLmN1cnJlbnQsIHRvb2xiYXJJdGVtcyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGdvb2dsZUNoYXJ0RWRpdG9yID0gbnVsbDtcbiAgICAgICAgaWYgKGdldENoYXJ0RWRpdG9yKSB7XG4gICAgICAgICAgICBnb29nbGVDaGFydEVkaXRvciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5DaGFydEVkaXRvcigpO1xuICAgICAgICAgICAgZ2V0Q2hhcnRFZGl0b3Ioe1xuICAgICAgICAgICAgICAgIGNoYXJ0RWRpdG9yOiBnb29nbGVDaGFydEVkaXRvcixcbiAgICAgICAgICAgICAgICBjaGFydFdyYXBwZXI6IGdvb2dsZUNoYXJ0V3JhcHBlcixcbiAgICAgICAgICAgICAgICBnb29nbGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRFZGl0b3IsXG4gICAgICAgICAgICBnb29nbGVDaGFydENvbnRyb2xzOiBnb29nbGVDaGFydENvbnRyb2xzLFxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnREYXNoYm9hcmQ6IGdvb2dsZUNoYXJ0RGFzaGJvYXJkLFxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyLFxuICAgICAgICAgICAgaXNSZWFkeTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRXcmFwcGVyKSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5nb29nbGVDaGFydERhc2hib2FyZCkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRDb250cm9scykgcmV0dXJuO1xuICAgICAgICBjb25zdCB7IGNvbnRyb2xzICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKGNvbnRyb2xzKSB7XG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgY29udHJvbHMubGVuZ3RoOyBpICs9IDEpe1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgY29udHJvbFR5cGUgLCBvcHRpb25zICwgY29udHJvbFdyYXBwZXJQYXJhbXMgIH0gPSBjb250cm9sc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoY29udHJvbFdyYXBwZXJQYXJhbXMgJiYgXCJzdGF0ZVwiIGluIGNvbnRyb2xXcmFwcGVyUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRDb250cm9sc1tpXS5jb250cm9sLnNldFN0YXRlKGNvbnRyb2xXcmFwcGVyUGFyYW1zW1wic3RhdGVcIl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmdvb2dsZUNoYXJ0Q29udHJvbHNbaV0uY29udHJvbC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRDb250cm9sc1tpXS5jb250cm9sLnNldENvbnRyb2xUeXBlKGNvbnRyb2xUeXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuaXNSZWFkeSAhPT0gbmV4dFN0YXRlLmlzUmVhZHkgfHwgbmV4dFByb3BzLmNvbnRyb2xzICE9PSB0aGlzLnByb3BzLmNvbnRyb2xzO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgd2lkdGggLCBoZWlnaHQgLCBvcHRpb25zICwgc3R5bGUgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCBkaXZTdHlsZSA9IHtcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0IHx8IG9wdGlvbnMgJiYgb3B0aW9ucy5oZWlnaHQsXG4gICAgICAgICAgICB3aWR0aDogd2lkdGggfHwgb3B0aW9ucyAmJiBvcHRpb25zLndpZHRoLFxuICAgICAgICAgICAgLi4uc3R5bGVcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVuZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgICAgICAgICByZWY6IHRoaXMuZGFzaGJvYXJkX3JlZixcbiAgICAgICAgICAgICAgICBzdHlsZTogZGl2U3R5bGVcbiAgICAgICAgICAgIH0sIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICAgICAgICAgICAgcmVmOiB0aGlzLnRvb2xiYXJfcmVmLFxuICAgICAgICAgICAgICAgIGlkOiBcInRvb2xiYXJcIlxuICAgICAgICAgICAgfSksIHRoaXMucHJvcHMucmVuZGVyKHtcbiAgICAgICAgICAgICAgICByZW5kZXJDaGFydDogdGhpcy5yZW5kZXJDaGFydCxcbiAgICAgICAgICAgICAgICByZW5kZXJDb250cm9sOiB0aGlzLnJlbmRlckNvbnRyb2wsXG4gICAgICAgICAgICAgICAgcmVuZGVyVG9vbGJhcjogdGhpcy5yZW5kZXJUb29sQmFyXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgICAgICAgICByZWY6IHRoaXMuZGFzaGJvYXJkX3JlZixcbiAgICAgICAgICAgICAgICBzdHlsZTogZGl2U3R5bGVcbiAgICAgICAgICAgIH0sIHRoaXMucmVuZGVyQ29udHJvbCgocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgbGV0IHsgY29udHJvbFByb3AgIH0gPSBwYXJhbTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbFByb3AuY29udHJvbFBvc2l0aW9uICE9PSBcImJvdHRvbVwiO1xuICAgICAgICAgICAgfSksIHRoaXMucmVuZGVyQ2hhcnQoKSwgdGhpcy5yZW5kZXJDb250cm9sKChwYXJhbSk9PntcbiAgICAgICAgICAgICAgICBsZXQgeyBjb250cm9sUHJvcCAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb250cm9sUHJvcC5jb250cm9sUG9zaXRpb24gPT09IFwiYm90dG9tXCI7XG4gICAgICAgICAgICB9KSwgdGhpcy5yZW5kZXJUb29sQmFyKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MxKXtcbiAgICAgICAgdmFyIF90aGlzMTtcbiAgICAgICAgc3VwZXIoLi4uYXJnczEpLCBfdGhpczEgPSB0aGlzO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRXcmFwcGVyOiBudWxsLFxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnREYXNoYm9hcmQ6IG51bGwsXG4gICAgICAgICAgICBnb29nbGVDaGFydENvbnRyb2xzOiBudWxsLFxuICAgICAgICAgICAgZ29vZ2xlQ2hhcnRFZGl0b3I6IG51bGwsXG4gICAgICAgICAgICBpc1JlYWR5OiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdyYXBoSUQgPSBudWxsO1xuICAgICAgICB0aGlzLmRhc2hib2FyZF9yZWYgPSAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZVJlZigpO1xuICAgICAgICB0aGlzLnRvb2xiYXJfcmVmID0gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVSZWYoKTtcbiAgICAgICAgdGhpcy5nZXRHcmFwaElEID0gKCk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgZ3JhcGhJRCAsIGdyYXBoX2lkICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZUdyYXBoSUQ7XG4gICAgICAgICAgICBpZiAoIWdyYXBoSUQgJiYgIWdyYXBoX2lkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmdyYXBoSUQpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VHcmFwaElEID0gZ2VuZXJhdGVVbmlxdWVJRCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlR3JhcGhJRCA9IHRoaXMuZ3JhcGhJRDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdyYXBoSUQgJiYgIWdyYXBoX2lkKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VHcmFwaElEID0gZ3JhcGhJRDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ3JhcGhfaWQgJiYgIWdyYXBoSUQpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUdyYXBoSUQgPSBncmFwaF9pZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VHcmFwaElEID0gZ3JhcGhJRDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZ3JhcGhJRCA9IGluc3RhbmNlR3JhcGhJRDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdyYXBoSUQ7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0Q29udHJvbElEID0gKGlkLCBpbmRleCk9PntcbiAgICAgICAgICAgIGNvbnRyb2xDb3VudGVyICs9IDE7XG4gICAgICAgICAgICBsZXQgY29udHJvbElEO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xJRCA9IFwiZ29vZ2xlY2hhcnQtY29udHJvbC1cIi5jb25jYXQoaW5kZXgsIFwiLVwiKS5jb25jYXQoY29udHJvbENvdW50ZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250cm9sSUQgPSBpZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb250cm9sSUQ7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkQ29udHJvbHMgPSAoZ29vZ2xlQ2hhcnRXcmFwcGVyLCBnb29nbGVDaGFydERhc2hib2FyZCk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgZ29vZ2xlICwgY29udHJvbHMgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgZ29vZ2xlQ2hhcnRDb250cm9scyA9ICFjb250cm9scyA/IG51bGwgOiBjb250cm9scy5tYXAoKGNvbnRyb2wsIGkpPT57XG4gICAgICAgICAgICAgICAgY29uc3QgeyBjb250cm9sSUQ6IGNvbnRyb2xJRE1heWJlICwgY29udHJvbFR5cGUgLCBvcHRpb25zOiBjb250cm9sT3B0aW9ucyAsIGNvbnRyb2xXcmFwcGVyUGFyYW1zICwgIH0gPSBjb250cm9sO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRyb2xJRCA9IHRoaXMuZ2V0Q29udHJvbElEKGNvbnRyb2xJRE1heWJlLCBpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjb250cm9sUHJvcDogY29udHJvbCxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbDogbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbnRyb2xXcmFwcGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcklkOiBjb250cm9sSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbnRyb2xPcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uY29udHJvbFdyYXBwZXJQYXJhbXNcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIWdvb2dsZUNoYXJ0Q29udHJvbHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdvb2dsZUNoYXJ0RGFzaGJvYXJkLmJpbmQoZ29vZ2xlQ2hhcnRDb250cm9scy5tYXAoKHBhcmFtKT0+e1xuICAgICAgICAgICAgICAgIGxldCB7IGNvbnRyb2wgIH0gPSBwYXJhbTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbDtcbiAgICAgICAgICAgIH0pLCBnb29nbGVDaGFydFdyYXBwZXIpO1xuICAgICAgICAgICAgZm9yIChsZXQgY2hhcnRDb250cm9sIG9mIGdvb2dsZUNoYXJ0Q29udHJvbHMpe1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgY29udHJvbCAsIGNvbnRyb2xQcm9wICB9ID0gY2hhcnRDb250cm9sO1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgY29udHJvbEV2ZW50cyA9W10gIH0gPSBjb250cm9sUHJvcDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBldmVudCBvZiBjb250cm9sRXZlbnRzKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBjYWxsYmFjayAsIGV2ZW50TmFtZSAgfSA9IGV2ZW50O1xuICAgICAgICAgICAgICAgICAgICBnb29nbGUudmlzdWFsaXphdGlvbi5ldmVudHMucmVtb3ZlTGlzdGVuZXIoY29udHJvbCwgZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZS52aXN1YWxpemF0aW9uLmV2ZW50cy5hZGRMaXN0ZW5lcihjb250cm9sLCBldmVudE5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5Kyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRXcmFwcGVyOiBnb29nbGVDaGFydFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbFdyYXBwZXI6IGNvbnRyb2wsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IF90aGlzLnByb3BzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZTogZ29vZ2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50QXJnczogYXJnc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBnb29nbGVDaGFydENvbnRyb2xzO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJlbmRlckNoYXJ0ID0gKCk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgd2lkdGggLCBoZWlnaHQgLCBvcHRpb25zICwgc3R5bGUgLCBjbGFzc05hbWUgLCByb290UHJvcHMgLCBnb29nbGUgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgZGl2U3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQgfHwgb3B0aW9ucyAmJiBvcHRpb25zLmhlaWdodCxcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGggfHwgb3B0aW9ucyAmJiBvcHRpb25zLndpZHRoLFxuICAgICAgICAgICAgICAgIC4uLnN0eWxlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICBpZDogdGhpcy5nZXRHcmFwaElEKCksXG4gICAgICAgICAgICAgICAgc3R5bGU6IGRpdlN0eWxlLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lXG4gICAgICAgICAgICB9LCByb290UHJvcHMpLCB0aGlzLnN0YXRlLmlzUmVhZHkgJiYgdGhpcy5zdGF0ZS5nb29nbGVDaGFydFdyYXBwZXIgIT09IG51bGwgPyAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChHb29nbGVDaGFydERhdGFUYWJsZSwge1xuICAgICAgICAgICAgICAgIGdvb2dsZUNoYXJ0V3JhcHBlcjogdGhpcy5zdGF0ZS5nb29nbGVDaGFydFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgZ29vZ2xlOiBnb29nbGUsXG4gICAgICAgICAgICAgICAgZ29vZ2xlQ2hhcnREYXNoYm9hcmQ6IHRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnREYXNoYm9hcmRcbiAgICAgICAgICAgIH0pLCAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoR29vZ2xlQ2hhcnRFdmVudHMsIHtcbiAgICAgICAgICAgICAgICBnb29nbGVDaGFydFdyYXBwZXI6IHRoaXMuc3RhdGUuZ29vZ2xlQ2hhcnRXcmFwcGVyLFxuICAgICAgICAgICAgICAgIGdvb2dsZTogZ29vZ2xlXG4gICAgICAgICAgICB9KSkgOiBudWxsKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yZW5kZXJDb250cm9sID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgZmlsdGVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMF0gOiAocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzMS5zdGF0ZS5pc1JlYWR5ICYmIF90aGlzMS5zdGF0ZS5nb29nbGVDaGFydENvbnRyb2xzICE9PSBudWxsID8gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkZyYWdtZW50LCBudWxsLCBfdGhpczEuc3RhdGUuZ29vZ2xlQ2hhcnRDb250cm9scy5maWx0ZXIoKHBhcmFtKT0+e1xuICAgICAgICAgICAgICAgIGxldCB7IGNvbnRyb2xQcm9wICwgY29udHJvbCAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIoe1xuICAgICAgICAgICAgICAgICAgICBjb250cm9sLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sUHJvcFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkubWFwKChwYXJhbSk9PntcbiAgICAgICAgICAgICAgICBsZXQgeyBjb250cm9sICwgY29udHJvbFByb3AgIH0gPSBwYXJhbTtcbiAgICAgICAgICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiBjb250cm9sLmdldENvbnRhaW5lcklkKCksXG4gICAgICAgICAgICAgICAgICAgIGlkOiBjb250cm9sLmdldENvbnRhaW5lcklkKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pKSA6IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucmVuZGVyVG9vbEJhciA9ICgpPT57XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMudG9vbGJhckl0ZW1zKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgICAgICAgICAgIHJlZjogdGhpcy50b29sYmFyX3JlZlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5jbGFzcyBDaGFydCQxIGV4dGVuZHMgKFJlYWN0LkNvbXBvbmVudCkge1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgeyBjaGFydExhbmd1YWdlICwgY2hhcnRQYWNrYWdlcyAsIGNoYXJ0VmVyc2lvbiAsIG1hcHNBcGlLZXkgLCBsb2FkZXIgLCBlcnJvckVsZW1lbnQgLCAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29udGV4dFByb3ZpZGVyLCB7XG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5wcm9wc1xuICAgICAgICB9LCB0aGlzLnN0YXRlLmxvYWRpbmdTdGF0dXMgPT09IFwicmVhZHlcIiAmJiB0aGlzLnN0YXRlLmdvb2dsZSAhPT0gbnVsbCA/IC8qI19fUFVSRV9fKi8gUmVhY3QuY3JlYXRlRWxlbWVudChHb29nbGVDaGFydCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgZ29vZ2xlOiB0aGlzLnN0YXRlLmdvb2dsZVxuICAgICAgICB9KSkgOiB0aGlzLnN0YXRlLmxvYWRpbmdTdGF0dXMgPT09IFwiZXJyb3JlZFwiICYmIGVycm9yRWxlbWVudCA/IGVycm9yRWxlbWVudCA6IGxvYWRlciwgLyojX19QVVJFX18qLyBSZWFjdC5jcmVhdGVFbGVtZW50KExvYWRHb29nbGVDaGFydHMsIHtcbiAgICAgICAgICAgIGNoYXJ0TGFuZ3VhZ2U6IGNoYXJ0TGFuZ3VhZ2UsXG4gICAgICAgICAgICBjaGFydFBhY2thZ2VzOiBjaGFydFBhY2thZ2VzLFxuICAgICAgICAgICAgY2hhcnRWZXJzaW9uOiBjaGFydFZlcnNpb24sXG4gICAgICAgICAgICBtYXBzQXBpS2V5OiBtYXBzQXBpS2V5LFxuICAgICAgICAgICAgb25Mb2FkOiB0aGlzLm9uTG9hZCxcbiAgICAgICAgICAgIG9uRXJyb3I6IHRoaXMub25FcnJvclxuICAgICAgICB9KSk7XG4gICAgfVxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl9pc01vdW50ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gICAgfVxuICAgIGlzRnVsbHlMb2FkZWQoZ29vZ2xlKSB7XG4gICAgICAgIGNvbnN0IHsgY29udHJvbHMgLCB0b29sYmFySXRlbXMgLCBnZXRDaGFydEVkaXRvciAgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHJldHVybiBnb29nbGUgJiYgZ29vZ2xlLnZpc3VhbGl6YXRpb24gJiYgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ2hhcnRXcmFwcGVyICYmIGdvb2dsZS52aXN1YWxpemF0aW9uLkRhc2hib2FyZCAmJiAoIWNvbnRyb2xzIHx8IGdvb2dsZS52aXN1YWxpemF0aW9uLkNoYXJ0V3JhcHBlcikgJiYgKCFnZXRDaGFydEVkaXRvciB8fCBnb29nbGUudmlzdWFsaXphdGlvbi5DaGFydEVkaXRvcikgJiYgKCF0b29sYmFySXRlbXMgfHwgZ29vZ2xlLnZpc3VhbGl6YXRpb24uZHJhd1Rvb2xiYXIpO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbG9hZGluZ1N0YXR1czogXCJsb2FkaW5nXCIsXG4gICAgICAgICAgICBnb29nbGU6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vbkxvYWQgPSAoZ29vZ2xlMSk9PntcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uTG9hZCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25Mb2FkKGdvb2dsZTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuaXNGdWxseUxvYWRlZChnb29nbGUxKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub25TdWNjZXNzKGdvb2dsZTEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJRTExOiB3aW5kb3cuZ29vZ2xlIGlzIG5vdCBmdWxseSBzZXQsIHdlIGhhdmUgdG8gd2FpdFxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gc2V0SW50ZXJ2YWwoKCk9PntcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ29vZ2xlID0gd2luZG93Lmdvb2dsZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzTW91bnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdvb2dsZSAmJiB0aGlzLmlzRnVsbHlMb2FkZWQoZ29vZ2xlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25TdWNjZXNzKGdvb2dsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9uU3VjY2VzcyA9IChnb29nbGUpPT57XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nU3RhdHVzOiBcInJlYWR5XCIsXG4gICAgICAgICAgICAgICAgZ29vZ2xlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vbkVycm9yID0gKCk9PntcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmdTdGF0dXM6IFwiZXJyb3JlZFwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5DaGFydCQxLmRlZmF1bHRQcm9wcyA9IGNoYXJ0RGVmYXVsdFByb3BzO1xuXG52YXIgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGU7XG4oZnVuY3Rpb24oR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGUpIHtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcImFubm90YXRpb25cIl0gPSBcImFubm90YXRpb25cIjtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcImFubm90YXRpb25UZXh0XCJdID0gXCJhbm5vdGF0aW9uVGV4dFwiO1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1wiY2VydGFpbnR5XCJdID0gXCJjZXJ0YWludHlcIjtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcImVtcGhhc2lzXCJdID0gXCJlbXBoYXNpc1wiO1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1wiaW50ZXJ2YWxcIl0gPSBcImludGVydmFsXCI7XG4gICAgR29vZ2xlRGF0YVRhYmxlQ29sdW1uUm9sZVR5cGVbXCJzY29wZVwiXSA9IFwic2NvcGVcIjtcbiAgICBHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZVtcInN0eWxlXCJdID0gXCJzdHlsZVwiO1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1widG9vbHRpcFwiXSA9IFwidG9vbHRpcFwiO1xuICAgIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlW1wiZG9tYWluXCJdID0gXCJkb21haW5cIjtcbn0pKEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlIHx8IChHb29nbGVEYXRhVGFibGVDb2x1bW5Sb2xlVHlwZSA9IHt9KSk7XG5cbnZhciBDaGFydCA9IENoYXJ0JDE7XG5cbmV4cG9ydCB7IENoYXJ0JDEgYXMgQ2hhcnQsIEdvb2dsZURhdGFUYWJsZUNvbHVtblJvbGVUeXBlLCBDaGFydCBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXBcbiIsImltcG9ydCB7IFJlYWN0RWxlbWVudCwgY3JlYXRlRWxlbWVudCwgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgT2JqZWN0SXRlbSwgRWRpdGFibGVWYWx1ZSB9IGZyb20gJ21lbmRpeCc7XG5pbXBvcnQgQ2hhcnQgZnJvbSAncmVhY3QtZ29vZ2xlLWNoYXJ0cyc7XG5cbmltcG9ydCB7IE5ld0dhbnR0V2lkZ2V0Q29udGFpbmVyUHJvcHMgfSBmcm9tIFwiLi4vdHlwaW5ncy9OZXdHYW50dFdpZGdldFByb3BzXCI7XG5cbmltcG9ydCBcIi4vdWkvTmV3R2FudHRXaWRnZXQuY3NzXCI7XG5cbnR5cGUgQ2hhcnREYXRhVHlwZSA9IChzdHJpbmcgfCBEYXRlIHwgbnVtYmVyIHwgbnVsbClbXVtdOyBcblxuZnVuY3Rpb24gZW5zdXJlRGF0ZShkYXRlVmFsdWU6IEVkaXRhYmxlVmFsdWU8RGF0ZT4pOiBEYXRlIHwgc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKCFkYXRlVmFsdWUgfHwgZGF0ZVZhbHVlLnN0YXR1cyAhPT0gXCJhdmFpbGFibGVcIiB8fCBkYXRlVmFsdWUudmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKGRhdGVWYWx1ZS52YWx1ZSk7XG4gICAgaWYgKGlzTmFOKGRhdGUuZ2V0VGltZSgpKSkgcmV0dXJuIG51bGw7XG4gICAgXG4gICAgLy8gRm9ybWF0IDE6IFJldHVybiBhcyBpcyAoSmF2YVNjcmlwdCBEYXRlIG9iamVjdClcbiAgICByZXR1cm4gZGF0ZTtcbiAgICBcbiAgICAvLyBGb3JtYXQgMjogSVNPIHN0cmluZ1xuICAgIC8vcmV0dXJuIGRhdGUudG9JU09TdHJpbmcoKTtcbiAgICBcbiAgICAvLyBGb3JtYXQgMzogU3BlY2lmaWMgc3RyaW5nIGZvcm1hdFxuICAgIC8vcmV0dXJuIGAke2RhdGUuZ2V0RnVsbFllYXIoKX0tJHtTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgJzAnKX0tJHtTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyl9ICR7U3RyaW5nKGRhdGUuZ2V0SG91cnMoKSkucGFkU3RhcnQoMiwgJzAnKX06JHtTdHJpbmcoZGF0ZS5nZXRNaW51dGVzKCkpLnBhZFN0YXJ0KDIsICcwJyl9OiR7U3RyaW5nKGRhdGUuZ2V0U2Vjb25kcygpKS5wYWRTdGFydCgyLCAnMCcpfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBOZXdHYW50dFdpZGdldCh7IGRhdGFTb3VyY2UsIHRhc2tJZCwgdGFza05hbWUsIHRhc2tSZXNvdXJjZSwgc3RhcnREYXRlLCBlbmREYXRlLCB0YXNrRHVyYXRpb24sIHBlcmNlbnRDb21wbGV0ZSwgdGFza0RlcGVuZGVuY2llcywgcm93RGFya0NvbG9yLCByb3dOb3JtYWxDb2xvciwgZm9udFNpemUsIGZvbnRUeXBlLCBmb250Q29sb3IsIGdhbnR0SGVpZ2h0LCBzaG93Q3JpdGljYWxQYXRoIH06IE5ld0dhbnR0V2lkZ2V0Q29udGFpbmVyUHJvcHMpOiBSZWFjdEVsZW1lbnQge1xuXG4gICAgY29uc3QgW2NoYXJ0RGF0YSwgc2V0Q2hhcnREYXRhXSA9IHVzZVN0YXRlPENoYXJ0RGF0YVR5cGU+KFtdKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybURhdGEgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXI6IENoYXJ0RGF0YVR5cGUgPSBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1Rhc2sgSUQnLCBcbiAgICAgICAgICAgICAgICAgICdUYXNrIE5hbWUnLFxuICAgICAgICAgICAgICAgICAgJ1Jlc291cmNlJywgXG4gICAgICAgICAgICAgICAgICAnU3RhcnQgRGF0ZScsIFxuICAgICAgICAgICAgICAgICAgJ0VuZCBEYXRlJywgXG4gICAgICAgICAgICAgICAgICAnRHVyYXRpb24nLCBcbiAgICAgICAgICAgICAgICAgICdQZXJjZW50IENvbXBsZXRlJywgXG4gICAgICAgICAgICAgICAgICAnRGVwZW5kZW5jaWVzJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIF07XG4gXG4gICAgICAgICAgICBpZiAoZGF0YVNvdXJjZSAmJiBkYXRhU291cmNlLnN0YXR1cyA9PT0gJ2F2YWlsYWJsZScgJiYgZGF0YVNvdXJjZS5pdGVtcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkl0ZW1zOlwiLCBkYXRhU291cmNlLml0ZW1zKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gZGF0YVNvdXJjZS5pdGVtcy5tYXAoKGl0ZW06IE9iamVjdEl0ZW0pOiAoc3RyaW5nIHwgRGF0ZSB8IG51bWJlciB8IG51bGwpW10gID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93RGF0YSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tJZC5nZXQoaXRlbSkudmFsdWU/LnRvU3RyaW5nKCkgfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tOYW1lLmdldChpdGVtKS52YWx1ZT8udG9TdHJpbmcoKSB8fCBcIlVubmFtZWQgVGFza1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFza1Jlc291cmNlLmdldChpdGVtKS52YWx1ZT8udG9TdHJpbmcoKSB8fCBcIlVubmFtZWQgUmVzb3VyY2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuc3VyZURhdGUoc3RhcnREYXRlLmdldChpdGVtKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnN1cmVEYXRlKGVuZERhdGUuZ2V0KGl0ZW0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tEdXJhdGlvbi5nZXQoaXRlbSkudmFsdWU/LnRvTnVtYmVyKCkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmNlbnRDb21wbGV0ZS5nZXQoaXRlbSkudmFsdWU/LnRvTnVtYmVyKCkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tEZXBlbmRlbmNpZXMuZ2V0KGl0ZW0pLnZhbHVlPy50b1N0cmluZygpIHx8IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JvdyBkYXRhOicsIHJvd0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm93RGF0YTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkNoYXJ0IGRhdGE6IFwiLCBoZWFkZXIuY29uY2F0KGRhdGEpKTtcbiAgICAgICAgICAgICAgICBzZXRDaGFydERhdGEoaGVhZGVyLmNvbmNhdChkYXRhKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGRhdGFTb3VyY2UpIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybURhdGEoKTtcbiAgICAgICAgfVxuICAgIH0sIFtkYXRhU291cmNlLCB0YXNrSWQsIHRhc2tOYW1lLCB0YXNrUmVzb3VyY2UsIHN0YXJ0RGF0ZSwgZW5kRGF0ZSwgdGFza0R1cmF0aW9uLCBwZXJjZW50Q29tcGxldGUsIHRhc2tEZXBlbmRlbmNpZXNdKTtcblxuICAgIGNvbnN0IGdhbnR0T3B0aW9ucyA9IHtcbiAgICAgICAgZ2FudHQ6IHtcbiAgICAgICAgICBjcml0aWNhbFBhdGhFbmFibGVkOiBzaG93Q3JpdGljYWxQYXRoLFxuICAgICAgICAgIGlubmVyR3JpZFRyYWNrOiB7IGZpbGw6IHJvd05vcm1hbENvbG9yIH0sXG4gICAgICAgICAgaW5uZXJHcmlkRGFya1RyYWNrOiB7IGZpbGw6IHJvd0RhcmtDb2xvciB9LFxuICAgICAgICAgIHRpbWV6b25lOiAnR01UJywgLy8gb3IgeW91ciBzcGVjaWZpYyB0aW1lem9uZVxuICAgICAgICAgIGxhYmVsU3R5bGU6IHtcbiAgICAgICAgICAgIGZvbnROYW1lOiBmb250VHlwZSxcbiAgICAgICAgICAgIGZvbnRTaXplOiBmb250U2l6ZSxcbiAgICAgICAgICAgIGNvbG9yOiBmb250Q29sb3JcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxDaGFydFxuICAgICAgICAgICAgd2lkdGg9eycxMDAlJ31cbiAgICAgICAgICAgIGhlaWdodD17Z2FudHRIZWlnaHR9XG4gICAgICAgICAgICBjaGFydFR5cGU9XCJHYW50dFwiXG4gICAgICAgICAgICBsb2FkZXI9ezxkaXY+TG9hZGluZyBDaGFydC4uLjwvZGl2Pn1cbiAgICAgICAgICAgIGRhdGE9e2NoYXJ0RGF0YX1cbiAgICAgICAgICAgIG9wdGlvbnM9e2dhbnR0T3B0aW9uc31cbiAgICAgICAgLz5cbiAgICApO1xufSJdLCJuYW1lcyI6WyJ1c2VMb2FkU2NyaXB0Iiwic3JjIiwib25Mb2FkIiwib25FcnJvciIsInVzZUVmZmVjdCIsImRvY3VtZW50IiwiZm91bmRTY3JpcHQiLCJxdWVyeVNlbGVjdG9yIiwiY29uY2F0IiwiZGF0YXNldCIsImxvYWRlZCIsInNjcmlwdCIsImNyZWF0ZUVsZW1lbnQiLCJvbkxvYWRXaXRoTWFya2VyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImhlYWQiLCJhcHBlbmQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwidXNlU3RhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7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
