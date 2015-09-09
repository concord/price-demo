import React, { PropTypes } from 'react';
import GoogleChartSingleton from './GoogleChartLoader';
import  DEFAULT_COLORS from '../constants/DEFAULT_CHART_COLORS';

export default React.createClass({
    getInitialState() {
        let graphId = Math.floor(Math.random() * 100000);
        GoogleChartSingleton.promise().then(()=> {
            this.setState({
                chartWrapper: new google.visualization.ChartWrapper({
                    chartType: this.props.chartType,
                    dataTable: new window.google.visualization.DataTable(),
                    options: this.props.options,
                    containerId: graphId
                })
            });
            // google.visualization.events.addOneTimeListener(this.wrapper, 'ready', function() {
            //   self.chart = self.wrapper.getChart();
            //   self.listenToChartEvents.call(this);
            // });
            // if (this.props.legend_toggle) {
            //   google.visualization.events.addListener(this.wrapper, 'select', function() {
            //     self.default_chart_select.call(this);
            //   });
            // }
            // if (this.props.onSelect !== null) {
            //   google.visualization.events.addListener(this.wrapper, 'select', function() {
            //     self.props.onSelect(self, self.chart.getSelection());
            //   });
            //}
        });
        return {
            graphId: graphId
        };
    }
    componentDidMount() {
        GoogleChartSingleton.promise().then(()=>{
            this.drawChart();
        });
    }

    componentDidUpdate() {
        GoogleChartSingleton.promise().then(()=>{
            this.drawChart();
        });
    }
    propTypes: {
        chartType: PropTypes.string.isRequired;
    }
    getDefaultProps() {
        return {
            chartType: 'INVALID_CHART_TYPE',
            rows: [],
            columns: [],
            options: {
                chart: {
                    title: 'Title',
                    subtitle: 'Subtitle'
                },
                hAxis: {
                    title: 'X Label'
                },
                vAxis: {
                    title: 'Y Label'
                },
                width: '320px',
                height: '480px'

            },
            chartEvents: [],
            onSelect: null, // TODO(agallego): delete
            legendToggle: false
        };
    }
    render() {
        return (<div
            id={this.state.graphId}>
            height={this.props.height}
            width={this.props.width}
            </div>);
    }
    resetGraph() {
        // This is a react anti pattern, but otherwise it takes too long
        // to clean the graphs
        let data = this.state.chartWrapper.getDataTable();
        if (data) {
            data.removeRows(0, data.getNumberOfRows() || 0);
            data.removeColumns(0, data.getNumberOfColumns() || 0);
        }
        if (this.state.chartWrapper.getChart()) {
            this.state.chartWrapper.getChart().clearChart();
        }

        // repopulate teh graph
        for (var i = 0; i < this.props.columns.length; i++) {
            data.addColumn(this.props.columns[i].type, this.props.columns[i].label);
        }
        if (this.props.rows.length > 0) {
            data.addRows(this.props.rows);
        }

    }

    drawChart() {
        console.log("build the data table");
        this.resetGraph();
        this.state.chartWrapper.draw();
        this.wrapper.draw();

    }
    // listenToChartEvents() {
    //     var self = this;
    //     var event_data;
    //     for (var i = 0; i < this.props.chartEvents.length; i++) {
    //         if (this.props.chartEvents[i].eventName === 'ready') {
    //             this.props.chartEvents[i].callback(this);
    //         } else {
    //             var callback = self.props.chartEvents[i].callback;
    //             google.visualization.events.addListener(this.chart,
    //                this.props.chartEvents[i].eventName, function() {
    //                 callback(self);
    //             });
    //         }
    //     }
    // }
    // default_chart_select() {
    //     var selection = this.chart.getSelection();
    //     // if selection length is 0, we deselected an element
    //     if (selection.length > 0) {
    //         // if row is undefined, we clicked on the legend
    //         if (selection[0].row == null) {
    //             var column = selection[0].column;
    //             this.toggle_points(column);
    //         }
    //     }
    // }
    // build_empty_column(index) {
    //     return {
    //         label: this.data_table.getColumnLabel(index),
    //         type: this.data_table.getColumnType(index),
    //         calc: function() {
    //             return null;
    //         }
    //     };
    // }
    // build_column_from_src(index) {
    //     return {
    //         label: this.data_table.getColumnLabel(index),
    //         type: this.data_table.getColumnType(index),
    //         sourceColumn: index
    //     };
    // }
    // toggle_points(column) {
    //     //Need to show legend !!
    //     var view = new google.visualization.DataView(this.wrapper.getDataTable());
    //     var column_count = view.getNumberOfColumns();
    //     var colors = [];
    //     var columns = [];
    //     var empty_columns = [];
    //     var column_hidden;
    //     var empty_column;
    //     var column_from_src;
    //     for (var i = 0; i < column_count; i++) {
    //         // If user clicked on legend
    //         if (i === column) {
    //             column_hidden = (typeof this.hidden_columns[i] !== 'undefined');
    //             //User wants to hide values
    //             if (!column_hidden) {
    //                 // Null out the values of the column
    //                 empty_column = this.build_empty_column(i);
    //                 columns.push(empty_column);
    //                 this.hidden_columns[i] = {
    //                     color: this.get_column_color(i - 1)
    //                 };
    //                 colors.push('#CCCCCC');
    //             }
    //             //User wants to show values
    //             else {
    //                 column_from_src = this.build_column_from_src(i);
    //                 columns.push(column_from_src);
    //                 var previous_color = this.hidden_columns[i].color;
    //                 delete this.hidden_columns[i]
    //                 ;
    //                 colors.push(previous_color);
    //             }
    //         } else if (typeof this.hidden_columns[i] !== 'undefined') {
    //             empty_column = this.build_empty_column(i);
    //             columns.push(empty_column);
    //             colors.push('#CCCCCC');
    //         } else {
    //             column_from_src = this.build_column_from_src(i);
    //             columns.push(column_from_src);
    //             if (i !== 0) {
    //                 colors.push(this.get_column_color(i - 1));
    //             }
    //         }
    //     }
    //     view.setColumns(columns);
    //     this.props.options.colors = colors;
    //     this.chart.draw(view, this.props.options);
    // }
    // get_column_color(column_index) {
    //     if (this.props.options.colors) {
    //         if (this.props.options.colors[column_index]) {
    //             return this.props.options.colors[column_index];
    //         }
    //     } else {
    //         if (typeof DEFAULT_COLORS[column_index] !== 'undefined') {
    //             return DEFAULT_COLORS[column_index];
    //         } else {
    //             return DEFAULT_COLORS[0];
    //         }
    //     }
    // }

});
