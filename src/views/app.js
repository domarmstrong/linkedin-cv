"use strict";

import React from 'react';
import { DataTable, THead, TBody, TFoot, Tr, Th, Td } from '../components/DataTable';

export class App extends React.Component {

    constructor () {
        super();
        this.state = { };
        this.data = [
            { id: 1, name: 'ben' },
            { id: 2, name: 'jon' },
        ];
    }

    renderRow (item, i) {
        return (
            <Tr key={ item.id }>
                <Td>{ item.id }</Td>
                <Td>{ item.name }</Td>
            </Tr>
        );
    }

    render () {
        return (
            <div>
                <h1>App</h1>

                <h2>Table</h2>

                <DataTable rowHeight={ 60 } data={ this.data } renderRow={ this.renderRow }>
                    <THead>
                        <Tr>
                            <Th key="id">ID</Th>
                            <Th key="name">Name</Th>
                        </Tr>
                    </THead>
                    <TFoot>
                        <Tr>
                            <Td>total2</Td>
                            <Td>total1</Td>
                        </Tr>
                    </TFoot>
                </DataTable>
            </div>
        );
    }
}
