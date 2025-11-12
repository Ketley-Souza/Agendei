import { useState, useEffect } from 'react';
import { Table, Tag } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';



const { Column, HeaderCell, Cell } = Table;

const TableComponent = ({ rows, onRowClick, config, actions, loading }) => {
    const [data, setData] = useState([]);
    const [sortColumn, setSortColumn] = useState();
    const [sortType, setSortType] = useState();

    useEffect(() => {
        setData(rows);
    }, [rows]);

    const handleSortColumn = (sortColumn, sortType) => {
        const sorted = [...data].sort((a, b) => {
            let x = a[sortColumn];
            let y = b[sortColumn];

            if (typeof x === 'string') x = x.charCodeAt(0);
            if (typeof y === 'string') y = y.charCodeAt(0);

            return sortType === 'asc' ? x - y : y - x;
        });

        setSortColumn(sortColumn);
        setSortType(sortType);
        setData(sorted);
    };

    return (
        <div className="rounded-2xl overflow-hidden border border-gray-300 font-opensans ">
            <Table
                height={400}
                data={data}
                loading={loading}
                sortColumn={sortColumn}
                sortType={sortType}
                onSortColumn={handleSortColumn}
                onRowClick={onRowClick}
                bordered
                cellBordered
                rowClassName={() => 'custom-row-hover'}
            >
                {config.map((c) => (
                    <Column key={c.key} flexGrow={1} fixed={c.fixed} width={c.width}>
                        <HeaderCell>{c.label}</HeaderCell>
                        {!c.content ? (
                            <Cell dataKey={c.key} />
                        ) : (
                            <Cell dataKey={c.key}>
                                {(rowData) => c.content(rowData[c.key], rowData)}
                            </Cell>
                        )}
                    </Column>
                ))}

                <Column width={150} fixed="right">
                    <HeaderCell>Ações</HeaderCell>
                    <Cell>
                        {(rowData) => (
                            actions
                                ? actions(rowData)
                                : (
                                    <Tag
                                        color="gray"
                                        className="cursor-pointer"
                                        onClick={() => onRowClick(rowData)}
                                    >
                                        Editar
                                    </Tag>
                                )
                        )}
                    </Cell>
                </Column>
            </Table>
        </div>
    );
};

export default TableComponent;
