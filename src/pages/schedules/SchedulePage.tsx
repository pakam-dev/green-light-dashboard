import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReusableDataTable, TableColumn } from '@/components/dashboard/ReusableDataTable';
import { useDataTable } from '@/hooks/use-data-table';
import { Badge } from '@/components/ui/badge';

interface ScheduleItem {
  id: string;
  customerName: string;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  items: number;
}

// Mock data for demonstration
const mockInstantBuyPending: ScheduleItem[] = [
  { id: 'IB001', customerName: 'John Doe', address: '123 Main St, Lagos', scheduledDate: '2025-01-20', scheduledTime: '10:00 AM', status: 'pending', items: 5 },
  { id: 'IB002', customerName: 'Jane Smith', address: '456 Oak Ave, Abuja', scheduledDate: '2025-01-21', scheduledTime: '2:00 PM', status: 'pending', items: 3 },
  { id: 'IB003', customerName: 'Mike Johnson', address: '789 Pine Rd, Kano', scheduledDate: '2025-01-22', scheduledTime: '11:30 AM', status: 'pending', items: 8 },
];

const mockHouseholdPending: ScheduleItem[] = [
  { id: 'HH001', customerName: 'Sarah Wilson', address: '321 Elm St, Lagos', scheduledDate: '2025-01-20', scheduledTime: '9:00 AM', status: 'pending', items: 12 },
  { id: 'HH002', customerName: 'David Brown', address: '654 Maple Dr, Ibadan', scheduledDate: '2025-01-21', scheduledTime: '3:00 PM', status: 'pending', items: 7 },
];

const mockInstantBuyMissed: ScheduleItem[] = [
  { id: 'IB004', customerName: 'Chris Lee', address: '111 River Rd, Lagos', scheduledDate: '2025-01-15', scheduledTime: '10:00 AM', status: 'missed', items: 4 },
  { id: 'IB005', customerName: 'Emma Davis', address: '222 Lake Ave, Abuja', scheduledDate: '2025-01-14', scheduledTime: '1:00 PM', status: 'missed', items: 6 },
];

const mockHouseholdMissed: ScheduleItem[] = [
  { id: 'HH003', customerName: 'Tom Harris', address: '333 Hill St, Port Harcourt', scheduledDate: '2025-01-13', scheduledTime: '11:00 AM', status: 'missed', items: 9 },
];

const mockInstantBuyCompleted: ScheduleItem[] = [
  { id: 'IB006', customerName: 'Lisa Martin', address: '444 Valley Rd, Lagos', scheduledDate: '2025-01-10', scheduledTime: '2:00 PM', status: 'completed', items: 5 },
  { id: 'IB007', customerName: 'James White', address: '555 Mountain Ave, Enugu', scheduledDate: '2025-01-09', scheduledTime: '10:30 AM', status: 'completed', items: 3 },
  { id: 'IB008', customerName: 'Anna Clark', address: '666 Beach Blvd, Lagos', scheduledDate: '2025-01-08', scheduledTime: '4:00 PM', status: 'completed', items: 7 },
];

const mockHouseholdCompleted: ScheduleItem[] = [
  { id: 'HH004', customerName: 'Robert King', address: '777 Forest Lane, Kaduna', scheduledDate: '2025-01-07', scheduledTime: '9:30 AM', status: 'completed', items: 15 },
  { id: 'HH005', customerName: 'Mary Scott', address: '888 Garden St, Lagos', scheduledDate: '2025-01-06', scheduledTime: '1:30 PM', status: 'completed', items: 10 },
];

const columns: TableColumn<ScheduleItem>[] = [
  { key: 'id', header: 'Schedule ID' },
  { key: 'customerName', header: 'Customer Name' },
  { key: 'address', header: 'Address' },
  { key: 'scheduledDate', header: 'Date' },
  { key: 'scheduledTime', header: 'Time' },
  { key: 'items', header: 'Items' },
  {
    key: 'status',
    header: 'Status',
    render: (item) => {
      const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
        pending: { bg: 'rgba(234, 179, 8, 0.2)', text: '#ca8a04', border: 'rgba(234, 179, 8, 0.3)' },
        missed: { bg: 'rgba(239, 68, 68, 0.2)', text: '#dc2626', border: 'rgba(239, 68, 68, 0.3)' },
        completed: { bg: 'rgba(34, 197, 94, 0.2)', text: '#16a34a', border: 'rgba(34, 197, 94, 0.3)' },
      };
      const style = statusStyles[item.status] || statusStyles.pending;
      return (
        <Badge 
          variant="outline"
          className="capitalize border"
          style={{ 
            backgroundColor: style.bg, 
            color: style.text,
            borderColor: style.border
          }}
        >
          {item.status}
        </Badge>
      );
    },
  },
];

interface ScheduleTableProps {
  data: ScheduleItem[];
  emptyMessage: string;
}

const ScheduleTable = ({ data, emptyMessage }: ScheduleTableProps) => {
  const tableState = useDataTable({
    data,
    searchableFields: ['id', 'customerName', 'address'],
    initialPageSize: 10,
  });

  return (
    <ReusableDataTable
      tableState={tableState}
      columns={columns}
      searchPlaceholder="Search schedules..."
      emptyMessage={emptyMessage}
      showFilter={true}
      showExport={true}
      showRefresh={true}
    />
  );
};

const SchedulePage = () => {
  const [mainTab, setMainTab] = useState('pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Schedules</h1>
        <p className="text-muted-foreground">Manage your pickup schedules</p>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="pending">Pending Schedules</TabsTrigger>
          <TabsTrigger value="missed">Missed Schedules</TabsTrigger>
          <TabsTrigger value="completed">Completed Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Tabs defaultValue="instantbuy" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="instantbuy">Instant Buy</TabsTrigger>
              <TabsTrigger value="household">Household App</TabsTrigger>
            </TabsList>
            <TabsContent value="instantbuy">
              <ScheduleTable data={mockInstantBuyPending} emptyMessage="No pending schedules from Instant Buy" />
            </TabsContent>
            <TabsContent value="household">
              <ScheduleTable data={mockHouseholdPending} emptyMessage="No pending schedules from Household App" />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="missed" className="mt-6">
          <Tabs defaultValue="instantbuy" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="instantbuy">Instant Buy</TabsTrigger>
              <TabsTrigger value="household">Household App</TabsTrigger>
            </TabsList>
            <TabsContent value="instantbuy">
              <ScheduleTable data={mockInstantBuyMissed} emptyMessage="No missed schedules from Instant Buy" />
            </TabsContent>
            <TabsContent value="household">
              <ScheduleTable data={mockHouseholdMissed} emptyMessage="No missed schedules from Household App" />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <Tabs defaultValue="instantbuy" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="instantbuy">Instant Buy</TabsTrigger>
              <TabsTrigger value="household">Household App</TabsTrigger>
            </TabsList>
            <TabsContent value="instantbuy">
              <ScheduleTable data={mockInstantBuyCompleted} emptyMessage="No completed schedules from Instant Buy" />
            </TabsContent>
            <TabsContent value="household">
              <ScheduleTable data={mockHouseholdCompleted} emptyMessage="No completed schedules from Household App" />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulePage;
