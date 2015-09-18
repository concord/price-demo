import React from 'react';
import { AppCanvas, RaisedButton, Styles,
    Table, TableHeader, TableFooter, TableRow,
    TableHeaderColumn, TableRowColumn, TableBody } from 'material-ui';

const ThemeManager = new Styles.ThemeManager();


class MovingAveragesUtils {
    static percentChange(current, previous) {
        if(previous > 0) {
            const diff = previous - current;
            return ((diff / previous) * 100).toFixed(2);
        }
        return 0.0;
    }
    static arrowForChange(percentChange) {
        if(percentChange > 0) {
            return (<i className="fa fa-arrow-up" style={{
                color: 'green', paddingRight: '5px'}}></i>)
        }else if(percentChange < 0) {
            return (<i className="fa fa-arrow-down" style={{
                color: 'red', paddingRight: '5px'}}></i>)
        }
        return (<i className="fa fa-circle" style={{
            color: '#ffcc00', paddingRight: '5px'}}></i>)
    }
};

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
            matchAvgPrev: 0.0,
            matchPrice: 0.0,
            matchPricePrev: 0.0
        };
    },
    componentDidMount() {},


    render() {
        const matchAvgPercent = MovingAveragesUtils.percentChange(
            this.props.matchAvg, this.props.matchAvgPrev);

        const pricePercent = MovingAveragesUtils.percentChange(
            this.props.matchPrice, this.props.matchPricePrev);

        return (
            <Table
            fixedHeader={true}
            fixedFooter={true}
            selectable={false}
            multiSelectable={false}>
            <TableBody displayRowCheckbox={false}>
            <TableRow>
            <TableRowColumn>Price: $ {this.props.matchPrice.toFixed(2)}</TableRowColumn>
            <TableRowColumn>
            {MovingAveragesUtils.arrowForChange(pricePercent)}
            {pricePercent}%</TableRowColumn>
            <TableRowColumn>Moving Avg: $ {this.props.matchAvg.toFixed(2)}</TableRowColumn>
            <TableRowColumn>
            {MovingAveragesUtils.arrowForChange(matchAvgPercent)}
            {matchAvgPercent}%</TableRowColumn>
            </TableRow>
            </TableBody>
            <TableFooter>
            </TableFooter>
            </Table>
        );
    }
});
