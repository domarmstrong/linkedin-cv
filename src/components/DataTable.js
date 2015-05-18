"use strict";

import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
window._ = _;

/**
 * DataTable
 * ---------
 *
 * Table replacement
 *
 * Replicates the table widget but uses divs
 * Requires a rowHeight to be set, every row must be equal heights
 * If the table has a set height it can render only the rows required
 * which is very fast.
 *
 * Uses Tr, Td, Tbody etc
 *
 * Examples:
 * =========
 *
 * ### Standard table
 * ```
 * <DataTable rowHeight={ 20 }>
 *     <THead>
 *         <Tr>
 *             <Th>ID</Th>
 *             <Th>Name</Th>
 *         </Tr>
 *     </THead>
 *     <TBody>
 *         <Tr>
 *             <Td>1</Td>
 *             <Td>Dom</Td>
 *         </Tr>
 *     </TBody>
 *     <TFoot>
 *         <Tr>
 *             <Td>{ total2 }</Th>
 *             <Td>{ total1 }</Th>
 *         </Tr>
 *     </TFoot>
 * </DataTable>
 * ```
 *
 * ### Data driven table
 * ```
 * <DataTable data={[ { id: 1, name: 'Dom' } ]} rowHeight={ 20 }>
 *     <THead>
 *         <Tr>
 *             <Th key="id">ID</Th>
 *             <Th key="name">Name</Th>
 *         </Tr>
 *     </THead>
 * </DataTable>
 * ```
 *
 * ### Data driven table with custom rows
 * ```
 * function renderRow(item) {
 *     return (
 *         <Tr>
 *             <Td><em>{ item.id }</em></Td>
 *             <Td>{ item.name + ' ' + item.surname }</Td>
 *         </Tr>
 *     );
 * }
 *
 * // NOTE: The Tr element in the THead and TFoot elements may be omitted if you dont need to set props yourself
 * <DataTable data={[ { id: 1, name: 'Dom', surname: 'A' } ]} rowHeight={ 20 } renderRow={ renderRow }>
 *     <THead>
 *         <Th>ID</Th>
 *         <Th>Name</Th>
 *     </THead>
 * </DataTable>
 * ```
 *
 * ### Sortable table
 *
 * Columns will use the default sorting alphabetical sorting method unless a sortFunc is
 * provided on the Th for a column. The sort func works the same as Array.sort
 * [https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/sort]()
 *
 * ```
 * function sortByName(a, b) {
 *   return a < b ? 1 : -1;
 * }
 *
 * <DataTable sortable={ true } data={[ { id: 1, name: 'Dom', surname: 'A' } ]} rowHeight={ 20 }>
 *     <THead>
 *         <Tr>
 *             <Th key="id">ID</Th>
 *             <Th key="name" sortFunc={ sortByName }>Name</Th>
 *         </Tr>
 *     </THead>
 * </DataTable>
 * ```
 *
 * DataTable attributes
 * ====================
 *
 * * data [Array]: An array of objects
 * * uniqueKey [String]: If the objects have a unique key that can be used (by default tries to use id)
 * * selectable [Boolean]: Should row selection be enabled
 * * sortable [Boolean]: Should table be sortable by clicking on its th elements
 * * onSelect [Function]: Handler that is passed the array of selected items when selection changes
 *
 * ### Supported attributes
 *
 * * className
 * * title
 */

// TODO replace uuid
var util = {
    _uuid: 0,
    uuid () {
        return this._uuid++;
    }
};

/**
 * Keep a list of all mounted tables, used by the resize listener
 */
var tables = [];
var resizeListener = null;

// Fake thead element
export class THead extends React.Component {
    render () {
        return <div { ...this.props } className={ cx("thead", this.props.className) }>{ this.props.children }</div>;
    }
}

// Fake tbody element
export class TBody extends React.Component {
    render () {
        var style = {
            'position': 'absolute',
            'top': 0,
            'left': 0,
        };
        return <div { ...this.props } className={ cx("tbody", this.props.className) } style={ style }>{ this.props.children }</div>;
    }
}

// Fake tfoot element
export class TFoot extends React.Component {
    render () {
        return <div { ...this.props } className={ cx("tfoot", this.props.className) }>{ this.props.children }</div>;
    }
}

// Fake tr element
export class Tr extends React.Component {
    render () {
        return <div { ...this.props } className={ cx("tr", this.props.className) }>{ this.props.children }</div>;
    }
}

// Fake th element
export class Th extends React.Component {
    render () {
        return <div { ...this.props } className={ cx("th", this.props.className) }>{ this.props.children }</div>;
    }
}

// Fake td element
export class Td extends React.Component {
    render () {
        return <div { ...this.props } className={ cx("td", this.props.className) }>{ this.props.children }</div>;
    }
}

export class DataTable extends React.Component {

    constructor () {
        super();
        this.components = {
            thead: null,
            tbody: null,
            tfood: null,
        };
        this.columns = [];
        this.sortFuncs = {};
        this.range = { min: 0, max: 1 };
        this.state = {
            showEmptyMessage: false,
            sortKey: this.props.defaultSortKey,
            sortDir: this.props.defaultSortDir,
            selected: [],
        };
    }

    componentWillReceiveProps (props) {
        var self = this;

        if ('data' in props) {
            var data = props.data;

            // Attempt to maintain selection
            var selected = [];
            var key = self.props.hasOwnProperty('uniqueKey') ? self.props.uniqueKey : 'id';

            var keys = [];
            data.forEach(function (item) {
                var _key = item[key];
                if (! item.hasOwnProperty(key)) {
                    throw new Error('Every item in the data must have an id or uniqueKey');
                } else if (_key && typeof _key !== 'string' && typeof _key !== 'number') {
                    throw new Error('A key must be a number or a string, but got: ' + _key);
                } else if (keys.indexOf(_key) !== -1) {
                    throw new Error(`Key ${ key } with a value of ${ _key } is not unique`);
                }
                keys.push(_key);

                self.state.selected.forEach(function (_item) {
                    if (item[key] === _item[key]) selected.push(item);
                });
            });

            // Notify any listener that the selected objects have changed
            // The content of the object may be the same but the reference may be different
            if (this.props.onSelect) {
                // Have any of the objects changed?
                var changed = selected.some(function (item, i) {
                    return item !== self.state.selected[i];
                });
                if (changed) {
                    this.onSelect(selected);
                }
            }
            this.setState({ data: props.data, selected: selected });
        }
    }

    componentDidMount () {
        var self = this;
        tables.push(this);
        // Only add one resize listener for all DataTables
        if (tables.length && !resizeListener) {
            var fn = event => {
                tables.forEach(function (table) {
                    table.updateWidths();
                    table.getInitialRows();
                });
            }
            // Using array for ease of removal
            resizeListener = ['resize', fn, false];
            window.addEventListener.apply(window, resizeListener);
        }
        // Give the table a second to get data before displaying the empty message
        // or it flashes up on every table for a split second
        setTimeout(function () {
            if (self._lifeCycleState === "MOUNTED") {
                self.setState({ showEmptyMessage: true });
            }
        }, 1000);
        this.updateScrollPad();
        this.updateWidths();
        this.updateViewPort();
        this.getInitialRows();
    }

    componentWillUnmount () {
        tables.splice(tables.indexOf(this), 1);
        if (tables.length < 1) {
            window.removeEventListener.apply(window, resizeListener);
            resizeListener = null;
        }
    }

    componentDidUpdate (nextProps) {
        this.updateScrollPad();
        this.updateWidths();
        this.updateViewPort();
    }

    getRange () {
        var tb = React.findDOMNode(this.refs.tableBody);
        var bodyHeight = tb.getBoundingClientRect().height || Infinity;
        var rowHeight = this.props.rowHeight;
        var scroll = tb.scrollTop;

        if (rowHeight == null) {
            var min = 0;
            var max = 1;
        } else {
            var min = Math.floor(scroll / rowHeight);
            var max = min + Math.ceil(bodyHeight / rowHeight + 1);
        }
        this.range = { min: min, max: max };
    }

    getInitialRows () {
        this.getRange();
        this.forceUpdate();
    }

    updateScrollPosition (scrollToo) {
        var tb = React.findDOMNode(this.refs.tableBody);
        var rowHeight = this.props.rowHeight;
        var scroll = tb.scrollTop;
        var offset = scroll - (scroll - (this.range.min * rowHeight));
        var tbody = React.findDOMNode(this.refs.tbody);
        tbody.style.top = offset + 'px';

        if (!this.lastRange || this.range.min !== this.lastRange.min || this.range.max !== this.lastRange.max) {
            this.lastRange = { min: this.range.min, max: this.range.max };
            this.forceUpdate();
        }
    }

    updateViewPort () {
        var self = this;
        var table = React.findDOMNode(this.refs.table);
        var rowHeight = this.props.rowHeight;
        table.style.height = this.props.data.length * rowHeight + 'px';
    }

    updateScrollPad () {
        var total = React.findDOMNode(this.refs.tableBody).getBoundingClientRect().width;
        var table = React.findDOMNode(this.refs.table).getBoundingClientRect().width;

        var width = (total - table - 1) + 'px';
        if (width !== this._scrollPadWidth) {
            this._scrollPadWidth = width;
            React.findDOMNode(this.refs.scrollPad).style.width = width;
        }
    }

    updateWidths () {
        var self = this;
        var updateRequired = false;
        var col = 0;
        var ths = React.findDOMNode(this.refs.thead).querySelectorAll('.th');

        for (var i = 0; i < ths.length; i++) {
            var th = ths[i];
            var column = self.columns[col];
            // missing column due to conditional element eg. { show && <Th /> }
            if (! column) {
                col++;
                column = self.columns[col];
            }

            var width = th.getBoundingClientRect().width;
            if (column.width !== width) {
                updateRequired = true;
                column.width = width;
            }
            col++;
        }
        if (updateRequired) {
            setTimeout(function () {
                self.forceUpdate();
            }, 0);
        }
    }

    onSelect (selected) {
        var self = this;
        if (this.props.onSelect) {
            setTimeout(function () {
                self.props.onSelect(selected);
            }, 0);
        }
    }

    select (selected) {
        this.setState({ selected: selected });
        this.onSelect(selected)
    }

    deselect () {
        this.setState({ selected: [] });
        this.onSelect([])
    }

    scrollTo (item, animate) {
        var self = this;
        if (animate) {
            this._animateTo(item);
        } else {
            this._scrollTo(item);
        }
    }

    /**
     * swing easing. percent should be a decimal 0 - 1. eg 0.5 > 50% done
     */
    swing( percent ) {
        return 0.5 - Math.cos( percent*Math.PI ) / 2;
    }

    /**
     * Animate the scroll position so that (item) is at the top
     */
    _animateTo (item, duration) {
        var self = this;
        duration = duration || 500; // default 1 second
        var stepLength = 20; // 50ms
        var data = this.props.data;
        var index = data.indexOf(item);
        if (index === this.range.min || ! data.length) return; // Already at position

        var tb = React.findDOMNode(this.refs.tableBody);
        var currentPosition = tb.scrollTop;
        var endPosition = this._getPositionForIndex(index);

        var distance = 0, direction, count;
        if (currentPosition < endPosition) {
            direction = +1;
            distance = endPosition - currentPosition;
        } else if (currentPosition > endPosition) {
            direction = -1;
            distance = currentPosition - endPosition;
        }
        var steps = Math.ceil(duration / stepLength);
        var stepSize = distance / steps;

        if (direction === 1) {
            count = 0;
        } else {
            count = steps;
        }

        this.animateTimer = setInterval(function () {
            count = count + direction;

            var percent = (stepSize * count) / distance;
            if (direction === 1) {
                tb.scrollTop = currentPosition + (self._swing(percent) * distance);
            } else {
                tb.scrollTop = endPosition + (self._swing(percent) * distance);
            }

            if (direction === 1 && count === steps || direction === -1 && !count) {
                clearTimeout(self.animateTimer);
                return;
            }
        }, stepLength);
    }

    /**
     * Get the items position from the top of the container
     */
    _getPositionForIndex (index) {
        if (index < 0) return 0;
        var rowHeight = this.props.rowHeight;
        return rowHeight * index;
    }

    /**
     * Move the scroll position so that (item) is at the top
     */
    _scrollTo (item) {
        var rangeLength = this.range.max - this.range.min;
        var index = this.props.data.indexOf(item);
        if (index === this.range.min) return; // Already at position
        var min = index === -1 ? 0 : index;

        // Dont move the view past the end of the data
        if (min + rangeLength > this.props.data.length) {
            min = this.props.data.length - rangeLength;
            if (min < 0) min = 0;
        }

        this.range = {
            min: min,
            max: min + rangeLength
        };
        var tb = React.findDOMNode(this.refs.tableBody);
        tb.scrollTop = this._getPositionForIndex(min);
    }

    /**
     * Handle scrolling on the table body
     */
    handleScroll () {
        this.getRange();
        this.updateScrollPosition();
    }

    handleClickRow (event, data) {
        // TODO: handle multiple selection
        var selected = [data];
        this.select(selected);
    }

    /**
     * Args:
     *
     *     * sortKey [String]: The key the column is defined from
     *     * sortFunc [Function]: Optional sorting function to use on the data
     */
    handleSort(sortKey) {
        var sortDir = 'asc';
        if (this.state.sortKey === sortKey && this.state.sortDir === 'asc') {
            sortDir = 'desc';
        }
        this.setState({ sortKey: sortKey, sortDir: sortDir });
    }

    sortData () {
        if (! this.state.sortKey) return this.props.data;
        var key = this.state.sortKey;

        function basicSort(itemA, itemB) {
            var a = itemA[key];
            var b = itemB[key];
            if (typeof a === 'string') a = a.toLowerCase();
            if (typeof b === 'string') b = b.toLowerCase();
            if (a === null) return -1;
            if (b === null) return +1;
            if (a < b) return -1;
            if (a > b) return +1;
            return 0;
        }

        var sortFunc = this.sortFuncs[key] || basicSort;

        var sorted = this.props.data.slice(0).sort(sortFunc);
        if (this.state.sortDir === 'desc') {
            sorted.reverse();
        }
        return sorted;
    }

    /**
     * Find the thead, tbody and tfoot elements of the table if present
     */
    getTableComponents () {
        var self = this;
        this.components = {
            thead: null,
            tbody: null,
            tfood: null,
        };

        function getComponents(child) {
            if ( child.type === THead ) {
                self.components.thead = child;
            } else if ( child.type === TBody ) {
                self.components.tbody = child;
            } else if ( child.type === TFoot ) {
                self.components.tfoot = child;
            } else {
                console.log(child, THead, TBody, TFoot);
                throw new Error('Unexpected child for table, children must be THead, TBody or TFoot. Found: ' + child);
            }
        }

        React.Children.forEach(this.props.children, getComponents);
    }

    invalidChild (child, ...accepted) {
        console.info('unexpected child type: ', child, 'must be one of: ', ...accepted);
        throw new Error('Unexpected child type');
    }

    /**
     * The default render row function use for data driven tables if there is no tbody provided
     */
    renderRow (item, i) {
        // Was a uniqueKey provided, if not use id
        var uniqueKey = this.props.hasOwnProperty('uniqueKey') ? this.props.uniqueKey : 'id';
        // Default the key to the row number
        var key;
        if (item.hasOwnProperty(uniqueKey)) {
            key = item[uniqueKey];
        } else {
            console.error('No id or uniqueKey found in item', item);
        }
        return (
            <Tr key={ key }>{ this.columns.map(function (col) {
                return <Td key={ col.key }>{ item[col.key] }</Td>;
            }) }</Tr>
        );
    }

    /**
     * Render the rows of a data driven table
     *
     * If a renderRows function was provided use it, otherwise fallback
     * to the default renderRows function which relies on keys on the th elements
     */
    renderRows (renderRow) {
        var self = this;
        renderRow = renderRow || this.renderRow;

        var data = this.props.data;
        if (this.state.sortKey) {
            data = this.sortData();
        }
        var data = data.slice(this.range.min, this.range.max);

        return data.map(function (item, i) {
            var tr = renderRow(item, i);

            // Maintain the selected class if the item is in the selected array
            var classes = cx(tr.props.className, {
                'selected': self.state.selected.indexOf(item) !== -1,
                'selectable': tr.props.selectable !== false && self.props.selectable !== false,
            });
            // Set the height of the row
            var style = _.extend({}, tr.props.style);
            style.height = self.props.rowHeight;

            // Create a new tr object with modified props of the original
            // We do this because in order to modify a child it must belong to this instance
            // If the row was rendered from an outside renderRow function we cannot change it
            var props = _.extend({}, tr.props, {
                className: classes,
                style: style,
                onClick: function (event) {
                    if (tr.props.onClick) tr.props.onClick(event);
                    if (tr.props.selectable === false) return; // dont select a row with selectable={ false } allows info rows inline
                    self.handleClickRow(event, item);
                }
            });
            var _tr = React.cloneElement(tr, props);
            React.Children.forEach(_tr.props.children, function (td, i) {
                if (! td) return;
                if (! td.props.style) td.props.style = {};
                td.props.style.width = self.columns[i].width;
            });
            return _tr;
        });
    }

    renderTHead (hidden) {
        var thead = this.components.thead;
        var tr;
        var ths = [];

        // Iterate the THead children and find either a Tr or Th elements
        React.Children.forEach(thead.props.children, child => {
            if (child.type === Tr) tr = child;
            else if (child.type === Th) ths.push(child);
            else this.invalidChild(child, Tr, Th);
        });

        // If a Tr was found get the Th children from it
        if (tr) {
            React.Children.forEach(tr.props.children, child => {
                if (child.type === Th) ths.push(child);
                else this.invalidChild(child, Th);
            });
        }

        // Data driven tables with no renderRow function must give keys to th elements
        // in order to display the correct data in each column
        var shouldHaveKey = false;
        if (this.props.hasOwnProperty('data')) {
            if (! this.props.renderRow) {
                shouldHaveKey = true;
            }
        }

        var sortKey = this.state.sortKey;
        var sortDir = this.state.sortDir;
        // Iterate the th elements
        var thProps = [];
        ths.forEach((th, i) => {
            if (! th) return;
            var props = _.extend({}, th.props);
            var sortable = this.props.sortable && props.sortable !== false;
            if (sortable) {
                if (th.key === undefined) {
                    throw new Error('A sortable table must provide a key property on the th cells');
                }
                if (props.sortFunc) {
                    this.sortFuncs[th.key] = props.sortFunc;
                }
                props.onClick = function () {
                    this.handleSort(th.key);
                };
            }
            if (shouldHaveKey) {
                if (th.key === undefined || th.key === null) {
                    throw new Error('A data driven table that has no tbody must provide a key property on the th cells');
                } else {
                    props.key = th.key;
                }
            } else {
                props.key = i;
            }

            var classes = cx({
                'sortable': sortable,
                'sort-desc': th.key === sortKey && sortDir === 'desc',
                'sort-asc': th.key === sortKey && sortDir === 'asc',
                'flex-column': !props.width,
            });
            props.className = cx(props.className, classes);

            if (props.width) {
                if (!props.style) props.style = {};
                props.style.width = props.width;
            }

            if (! this.columns[i]) {
                this.columns[i] = { key: th.key };
            } else {
                this.columns[i].key = th.key;
            }
            thProps.push(props);
        });

        /*if (React.Children.count(tr.props.children) === 1) {
            var child = tr.props.children;
            child.key = util.uuid();
            tr.props.children = [ child ];
        }*/

        if (! tr) {
            tr = { props: {} };
        }
        var ThElements = thProps.map((props) => {
            return <Th key={ props.key } { ...props } />;
        });

        return (
            <THead ref="thead" { ...thead.props }>
                <Tr { ...tr.props }>
                    { ThElements }
                    <div ref="scrollPad" key="scrollPad" className="scrollPad" />
                </Tr>
            </THead>
        );
    }

    /**
     * Render the tbody component, there are 3 paths
     *
     * * tbody has a renderRow function, it will be used to generate rows from the tables data
     * * tbody has its own children, no change is made
     * * no tbody is provided, one is generated using keys from the thead
     */
    renderTbody () {
        var self = this;
        var tbody = this.components.tbody;
        var thead = this.components.thead;

        // NOTE: The ref added to the tbody is used in testing..
        if (tbody) {
            if (this.preRender) {
                // If this is a pre-render insert a dummy row
                tbody = React.cloneElement(tbody, { ref: 'tbody', children: [<Tr ref="dummyRow"><Td/></Tr>] });
            } else if (tbody.props.renderRow) {
                // The tbody element has a renderRow={ function } property, render rows with the custom function
                tbody = React.cloneElement(tbody, { ref: 'tbody', children: this.renderRows(tbody.props.renderRow) });
            } else {
                // The tbody has no renderRow function and is expected to provide its own tr elements as a standard table
                tbody = React.cloneElement(tbody, { ref: 'tbody' });
            }
        } else {
            // Render a new table body
            tbody = <TBody ref="tbody">{ this.renderRows() }</TBody>;
        }
        return tbody;
    }

    render () {
        var self = this;
        var tbody, thead;
        this.getTableComponents();

        // A data driven table must have a thead or a tbody
        if (this.props.hasOwnProperty('data') && !this.components.thead && !this.components.tbody) {
            throw new Error('A data driven table must have thead or tbody element');
        }

        thead = this.renderTHead();
        tbody = this.renderTbody();

        var classes = cx({
            'dcRTable': true,
            'dcFoTable': true,
            'scrolling': true,
            'selectable': this.props.selectable,
        });
        classes = this.props.className ? classes + ' ' + this.props.className : classes;

        var showEmptyMessage = this.state.showEmptyMessage && this.props.hasOwnProperty('data') && !this.props.data.length;

        var bodyStyle = {
            'overflowY': 'scroll'
        };
        var tableStyle = {
            'position': 'relative'
        };

        return (
            <div className={ classes } title={ this.props.title }>
                { thead }

                <div ref="tableBody" className="table-body" style={ bodyStyle } onScroll={ this.handleScroll }>
                    <div ref="table" style={ tableStyle } className="table">
                        { tbody }
                        { this.components.tfoot }
                    </div>
                    {/* Data has been passed to the table but it is empty */}
                    { showEmptyMessage ? <div className="no-data-message">There is no data to display</div> : null }
                </div>
            </div>
        );
    }
}

DataTable.propTypes = {
    data: React.PropTypes.array,
        selectable: React.PropTypes.bool,
        sortable: React.PropTypes.bool,
        onSelect: React.PropTypes.func,
};
DataTable.DefaultProps = {
    selectable: false, // Should selection be enabled.
    sortable: false, // Should the table be sortable.
    rowHeight: 30, // row height in pixels (must be fixed).
    defaultSortKey: null,
    defaultSortDir: 'asc',
};

