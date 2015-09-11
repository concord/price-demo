import React from 'react';
import { AppCanvas, RaisedButton, Styles,
    Table, TableHeader, TableFooter, TableRow,
    TableHeaderColumn, TableRowColumn, TableBody } from 'material-ui';

const ThemeManager = new Styles.ThemeManager();


export default React.createClass({
    getInitialState() {return {};},
    childContextTypes: {
        muiTheme: React.PropTypes.object
    },
    getChildContext() {
        return {
            muiTheme: ThemeManager.getCurrentTheme()
        };
    },
    getDefaultProps() {
        return {
            matchAvg: 0.0,
            matchAvgPrev: 0.0
        };
    },
    componentDidMount() {},

    render() {
        let arrow = ()=>{
            const c = this.props.matchAvg;
            const p = this.props.matchAvgPrev;
            const diff = p - c;
            if(diff == 0){
                return (<h1>-</h1>)
            }else if(diff > 0) {
                return (<i className="fa fa-arrow-up"></i>)
            }else {
                return (<i className="fa fa-arrow-down"></i>)
            }
        }();
        let percentChange = (this.props.matchAvgPrev - this.props.matchAvg) / 100;
        return (
            <Table
            fixedHeader={true}
            fixedFooter={true}
            selectable={false}
            multiSelectable={false}>
            <TableBody displayRowCheckbox={false}>
            <TableRow>
            <TableRowColumn>Matched Orders Moving Average</TableRowColumn>
            <TableRowColumn>{this.props.matchAvg}, {percentChange} {arrow}</TableRowColumn>
            </TableRow>
            </TableBody>
            <TableFooter>
            <TableRow>
            <TableRowColumn colSpan="2" style={{textAlign: 'right'}}>
            powered by Concord Systems & Coinbase
            </TableRowColumn>
            </TableRow>
            </TableFooter>
            </Table>
        );
    }
});
