"use client";

import { AddUserDialog } from "./add-user-dialog";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// Sample data - replace with your actual data source
const data = [
  {
    id: "1",
    djName: "DJ Snake",
    email: "snake@example.com",
    password: "********",
    type: "dj",
  },
  {
    id: "2",
    djName: "DJ Khaled",
    email: "khaled@example.com",
    password: "********",
    type: "dj",
  },
  // Add more sample data as needed
];

export type User = {
  id: string;
  djName: string;
  email: string;
  password: string;
  type: string;
};

export default function UserPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <AddUserDialog />
      </div>
      <DataTable<User, unknown> columns={columns} data={data} />
    </div>
  );
}
