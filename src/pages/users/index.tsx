import React from 'react';
import { ReusableDataTable, TableColumn } from '@/components/dashboard/ReusableDataTable';
import { useGetUsersQuery, User } from '@/store/api/usersApi';
import { useDataTable } from '@/hooks/use-data-table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

const UsersPage = () => {
  const { data: usersResponse, isLoading, refetch } = useGetUsersQuery();

  const tableState = useDataTable<User>({
    data: usersResponse?.data || [],
    initialPageSize: 10,
    searchableFields: ['name', 'email', 'phone', 'role'],
  });

  const columns: TableColumn<User>[] = [
    {
      key: 'name',
      header: 'Full Name',
    },
    {
      key: 'role',
      header: 'User Category',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'completedSchedule',
      header: 'Completed Schedule',
      render: (user) => (user as any).completedSchedule ?? 0,
    },
    {
      key: 'phone',
      header: 'Phone',
    },
  ];

  const renderActions = (user: User) => (
    <Button
      variant="ghost"
      size="sm"
      className="text-primary hover:text-primary/80"
      onClick={() => console.log('View user:', user.id)}
    >
      <Eye className="h-4 w-4 mr-1" />
      See more
    </Button>
  );

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Total Users</h1>
        <p className="text-muted-foreground">Manage and view all users</p>
      </div>

      <ReusableDataTable<User>
        tableState={tableState}
        columns={columns}
        showSearch
        showRefresh
        showPagination
        searchPlaceholder="Search users..."
        onRefresh={handleRefresh}
        renderRowActions={renderActions}
        emptyMessage="No users found"
      />
    </div>
  );
};

export default UsersPage;
