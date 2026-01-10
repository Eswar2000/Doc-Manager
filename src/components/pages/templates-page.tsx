
import { DataTable } from "../data-table/data-table";
import { getColumns } from "../data-table/columns";
import type { TemplateProps } from "../../types/index";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DataTableRowActions } from "../data-table/data-table-row-actions";
import { useState } from "react";
import { Trash2, Pencil, Eye } from "lucide-react";

export default function TemplatesPage() {
    const [data, setData] = useState<TemplateProps[]>([
        {
            "id": "0082d538-2937-4a44-9839-c2e2b097496e",
            "name": "Testing Template 1",
            "description": "Template for testing purposes.",
            "version": 1,
            "state": "active",
            "parentTemplateId": null,
            "createdAt": "2024-06-25T09:15:00",
            "htmlContent": "<p>This is a testing template: <span data-attribute-field=\"\" tracker-id=\"087db22e-2c51-48a5-b450-a347466a012a\" contenteditable=\"false\" class=\"inline-block align-middle mx-1 px-3 py-1 text-sm font-medium rounded-lg shadow-sm select-none cursor-pointer transition-all duration-150 bg-red-50 text-red-800 border border-red-300 hover:bg-red-100 hover:border-red-400\">{{ Company Name (Acme Corporation) }}</span>​</p>",
            "jsonContent": {
                "type": "doc",
                "content": [
                    {
                        "type": "paragraph",
                        "attrs": {
                            "textAlign": null
                        },
                        "content": [
                            {
                                "type": "text",
                                "text": "This is a testing template: "
                            },
                            {
                                "type": "attributeField",
                                "attrs": {
                                    "label": "Company Name",
                                    "trackerId": "087db22e-2c51-48a5-b450-a347466a012a",
                                    "required": true,
                                    "hidden": false,
                                    "defaultValue": "Acme Corporation",
                                    "fieldKey": "5"
                                }
                            },
                            {
                                "type": "text",
                                "text": ""
                            }
                        ]
                    }
                ]
            },
            "attributes": [
                {
                    "attributeId": "5",
                    "label": "Company Name",
                    "required": true,
                    "hidden": false,
                    "defaultValue": "Acme Corporation",
                    "trackerIds": [
                        "087db22e-2c51-48a5-b450-a347466a012a"
                    ]
                }
            ]
        },
        {
            "id": "07fc513d-1c66-4321-8dd9-eac1f348e837",
            "name": "Signing Template 1",
            "description": "Template with Signature Field. Try creating documents with this template.",
            "version": 1,
            "state": "active",
            "parentTemplateId": null,
            "createdAt": "2024-06-25T09:20:00",
            "htmlContent": "<p>This is a testing template with signature: <span data-attribute-field=\"\" tracker-id=\"dde1e6e9-e010-46b8-9d3c-e8ba1bee7fb6\" contenteditable=\"false\" class=\"inline-block align-middle mx-1 px-3 py-1 text-sm font-medium rounded-lg shadow-sm select-none cursor-pointer transition-all duration-150 bg-red-50 text-red-800 border border-red-300 hover:bg-red-100 hover:border-red-400\">{{ Signature }}</span>​</p>",
            "jsonContent": {
                "type": "doc",
                "content": [
                    {
                        "type": "paragraph",
                        "attrs": {
                            "textAlign": null
                        },
                        "content": [
                            {
                                "type": "text",
                                "text": "This is a testing template with signature: "
                            },
                            {
                                "type": "attributeField",
                                "attrs": {
                                    "label": "Signature",
                                    "trackerId": "dde1e6e9-e010-46b8-9d3c-e8ba1bee7fb6",
                                    "required": true,
                                    "hidden": false,
                                    "defaultValue": null,
                                    "fieldKey": "4"
                                }
                            },
                            {
                                "type": "text",
                                "text": ""
                            }
                        ]
                    }
                ]
            },
            "attributes": [
                {
                    "attributeId": "4",
                    "label": "Signature",
                    "required": true,
                    "hidden": false,
                    "defaultValue": null,
                    "trackerIds": [
                        "dde1e6e9-e010-46b8-9d3c-e8ba1bee7fb6"
                    ]
                }
            ]
        },
        {
            "id": "0082d538-2937-4a44-9839-c2e2b097496e",
            "name": "Demo Template 1",
            "description": "Template for testing purposes. Don't edit or delete.",
            "version": 1,
            "state": "archived",
            "parentTemplateId": null,
            "createdAt": "2024-06-25T09:15:00",
            "htmlContent": "<p>This is the original version: <span data-attribute-field=\"\" tracker-id=\"087db22e-2c51-48a5-b450-a347466a012a\" contenteditable=\"false\" class=\"inline-block align-middle mx-1 px-3 py-1 text-sm font-medium rounded-lg shadow-sm select-none cursor-pointer transition-all duration-150 bg-red-50 text-red-800 border border-red-300 hover:bg-red-100 hover:border-red-400\">{{ Company Name (Acme Corporation) }}</span></p>",
            "jsonContent": {
                "type": "doc",
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            { "type": "text", "text": "This is the original version: " },
                            {
                                "type": "attributeField",
                                "attrs": {
                                    "label": "Company Name",
                                    "trackerId": "087db22e-2c51-48a5-b450-a347466a012a",
                                    "required": true,
                                    "hidden": false,
                                    "defaultValue": "Acme Corporation",
                                    "fieldKey": "5"
                                }
                            }
                        ]
                    }
                ]
            },
            "attributes": [
                {
                    "attributeId": "5",
                    "label": "Company Name",
                    "required": true,
                    "hidden": false,
                    "defaultValue": "Acme Corporation",
                    "trackerIds": ["087db22e-2c51-48a5-b450-a347466a012a"]
                }
            ]
        },
        {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "name": "Demo Template 1",
            "description": "Template for testing purposes. Don't edit or delete. (Version 2 - added date field)",
            "version": 2,
            "state": "archived",
            "parentTemplateId": "0082d538-2937-4a44-9839-c2e2b097496e",
            "createdAt": "2024-07-10T14:30:00",
            "htmlContent": "<p>This is version 2: <span data-attribute-field=\"\" tracker-id=\"087db22e-2c51-48a5-b450-a347466a012a\" contenteditable=\"false\" class=\"inline-block align-middle mx-1 px-3 py-1 text-sm font-medium rounded-lg shadow-sm select-none cursor-pointer transition-all duration-150 bg-red-50 text-red-800 border border-red-300 hover:bg-red-100 hover:border-red-400\">{{ Company Name (Acme Corporation) }}</span> and <span data-attribute-field=\"\" tracker-id=\"123e4567-e89b-12d3-a456-426614174000\" contenteditable=\"false\" class=\"inline-block align-middle mx-1 px-3 py-1 text-sm font-medium rounded-lg shadow-sm select-none cursor-pointer transition-all duration-150 bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 hover:border-blue-400\">{{ Contract Date }}</span></p>",
            "jsonContent": {
                "type": "doc",
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            { "type": "text", "text": "This is version 2: " },
                            {
                                "type": "attributeField",
                                "attrs": {
                                    "label": "Company Name",
                                    "trackerId": "087db22e-2c51-48a5-b450-a347466a012a",
                                    "required": true,
                                    "hidden": false,
                                    "defaultValue": "Acme Corporation",
                                    "fieldKey": "5"
                                }
                            },
                            { "type": "text", "text": " and " },
                            {
                                "type": "attributeField",
                                "attrs": {
                                    "label": "Contract Date",
                                    "trackerId": "123e4567-e89b-12d3-a456-426614174000",
                                    "required": true,
                                    "hidden": false,
                                    "defaultValue": null,
                                    "fieldKey": "2"
                                }
                            }
                        ]
                    }
                ]
            },
            "attributes": [
                {
                    "attributeId": "5",
                    "label": "Company Name",
                    "required": true,
                    "hidden": false,
                    "defaultValue": "Acme Corporation",
                    "trackerIds": ["087db22e-2c51-48a5-b450-a347466a012a"]
                },
                {
                    "attributeId": "2",
                    "label": "Contract Date",
                    "required": true,
                    "hidden": false,
                    "defaultValue": null,
                    "trackerIds": ["123e4567-e89b-12d3-a456-426614174000"]
                }
            ]
        },
        {
            "id": "f9e8d7c6-b5a4-3210-9876-543210fedcba",
            "name": "Demo Template 1",
            "description": "Template for testing purposes. Don't edit or delete. (Version 3 - final with signature)",
            "version": 3,
            "state": "active",
            "parentTemplateId": "0082d538-2937-4a44-9839-c2e2b097496e",
            "createdAt": "2024-08-15T11:45:00",
            "htmlContent": "<p>This is the latest version 3: <span data-attribute-field=\"\" tracker-id=\"087db22e-2c51-48a5-b450-a347466a012a\" contenteditable=\"false\" class=\"inline-block align-middle mx-1 px-3 py-1 text-sm font-medium rounded-lg shadow-sm select-none cursor-pointer transition-all duration-150 bg-red-50 text-red-800 border border-red-300 hover:bg-red-100 hover:border-red-400\">{{ Company Name (Acme Corporation) }}</span>, <span data-attribute-field=\"\" tracker-id=\"123e4567-e89b-12d3-a456-426614174000\" contenteditable=\"false\" class=\"inline-block align-middle mx-1 px-3 py-1 text-sm font-medium rounded-lg shadow-sm select-none cursor-pointer transition-all duration-150 bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 hover:border-blue-400\">{{ Contract Date }}</span>, and <span data-attribute-field=\"\" tracker-id=\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\" contenteditable=\"false\" class=\"inline-block align-middle mx-1 px-3 py-1 text-sm font-medium rounded-lg shadow-sm select-none cursor-pointer transition-all duration-150 bg-purple-50 text-purple-800 border border-purple-300 hover:bg-purple-100 hover:border-purple-400\">{{ Signature }}</span></p>",
            "jsonContent": {
                "type": "doc",
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            { "type": "text", "text": "This is the latest version 3: " },
                            {
                                "type": "attributeField",
                                "attrs": {
                                    "label": "Company Name",
                                    "trackerId": "087db22e-2c51-48a5-b450-a347466a012a",
                                    "required": true,
                                    "hidden": false,
                                    "defaultValue": "Acme Corporation",
                                    "fieldKey": "5"
                                }
                            },
                            { "type": "text", "text": ", " },
                            {
                                "type": "attributeField",
                                "attrs": {
                                    "label": "Contract Date",
                                    "trackerId": "123e4567-e89b-12d3-a456-426614174000",
                                    "required": true,
                                    "hidden": false,
                                    "defaultValue": null,
                                    "fieldKey": "2"
                                }
                            },
                            { "type": "text", "text": ", and " },
                            {
                                "type": "attributeField",
                                "attrs": {
                                    "label": "Signature",
                                    "trackerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                                    "required": true,
                                    "hidden": false,
                                    "defaultValue": null,
                                    "fieldKey": "4"
                                }
                            }
                        ]
                    }
                ]
            },
            "attributes": [
                {
                    "attributeId": "5",
                    "label": "Company Name",
                    "required": true,
                    "hidden": false,
                    "defaultValue": "Acme Corporation",
                    "trackerIds": ["087db22e-2c51-48a5-b450-a347466a012a"]
                },
                {
                    "attributeId": "2",
                    "label": "Contract Date",
                    "required": true,
                    "hidden": false,
                    "defaultValue": null,
                    "trackerIds": ["123e4567-e89b-12d3-a456-426614174000"]
                },
                {
                    "attributeId": "4",
                    "label": "Signature",
                    "required": true,
                    "hidden": false,
                    "defaultValue": null,
                    "trackerIds": ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"]
                }
            ]
        }
    ]);

    const cols = getColumns<TemplateProps>([
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }) => (
                <div className="w-[150px] font-medium capitalize">{row.getValue("name")}</div>
            ),
            filterFn: (row, id, value) => {
                return row.getValue(id).toLowerCase().includes(value.toLowerCase());
            }
        },
        {
            accessorKey: "description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Description" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[500px] truncate capitalize">
                            {row.getValue("description")}
                        </span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return row.getValue(id).toLowerCase().includes(value.toLowerCase());
            }
        },
        {
            accessorKey: "state",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="State" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex w-[100px] items-center">
                        <span className="capitalize"> {row.getValue("state")}</span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "version",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Version" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex w-[100px] items-center">
                        <span className="capitalize"> {row.getValue("version")}</span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Created At" />
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"));
                const formattedDate = date.toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                });
                const formattedTime = date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                return (
                    <div className="flex w-[160px] items-center">
                        <span className="capitalize">{formattedDate} {formattedTime}</span>
                    </div>
                );
            },
        },
        {
            id: "actions",
            accessorKey: "actions",
            cell: ({ row }) => <DataTableRowActions row={row}
                actions={
                    [
                        {
                            title: "Edit",
                            icon: <Pencil className="h-4 w-4" />,
                            variant: "secondary",
                            onClick: () => { console.log("Editing template: " + row.original.name) }
                        },
                        {
                            title: "View Details",
                            icon: <Eye className="h-4 w-4" />,
                            variant: "secondary",
                            onClick: () => { console.log("viewing details of template: " + row.original.name) }
                        },
                        {
                            title: "Delete",
                            icon: <Trash2 className="h-4 w-4" />,
                            variant: "destructive",
                            onClick: () => { console.log("Deleting template: " + row.original.name) }
                        }
                    ]
                } />,
        }
    ])

    const filterConfigs = [
        {
            columnKey: "state",
            title: "State",
            options: [
                { label: "Active", value: "active" },
                { label: "Archived", value: "archived" },
            ]
        },
    ]

    return (
        <div className="h-full flex-1 flex-col space-y-2 p-8 md:flex">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 flex items-center gap-2">
                    <span>Manage Templates</span>
                </h2>
            </div>
            <DataTable data={data} columns={cols} filterColumnKey="name" facetedFilters={filterConfigs} showCreateButton={true} />
        </div>
    );
}
