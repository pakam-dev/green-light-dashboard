import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReusableDataTable, TableColumn } from '@/components/dashboard/ReusableDataTable';
import { useDataTable } from '@/hooks/use-data-table';
import { Badge } from '@/components/ui/badge';
import { useGetPickupByStatusQuery, wasteCategory } from '@/store/api/pickupsApi';

interface ScheduleItem {
  id: string;
  scheduleCreator: string;
  createdAt: string;
  address: string;
  categories: wasteCategory[];
  phone: string;
  quantity: string;
  // items: number;
}

// Mock data for demonstration
const mockInstantBuyPending: ScheduleItem[] = [];

const mockHouseholdPending: ScheduleItem[] = [];

const mockInstantBuyMissed: ScheduleItem[] = [];

const mockHouseholdMissed: ScheduleItem[] = [];

const mockInstantBuyCompleted: ScheduleItem[] = [];

const mockHouseholdCompleted: ScheduleItem[] = [];

const columns: TableColumn<ScheduleItem>[] = [
  // { key: 'id', header: 'Schedule ID' },
  { key: 'scheduleCreator', header: 'Fullname' },
  { key: 'address', header: 'Pickup Location' },
  { key: 'createdAt', 
    header: 'Created At',
    render: (row) => {
      const date = new Date(row.createdAt);
      return date.toLocaleDateString() 
      // + ' ' + date.toLocaleTimeString();
    }
  },
  {
    key: 'categories',
    header: 'Waste Categories',
    render: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.categories.map((category, index) => (
          <Badge
            key={index}
            variant="outline"
            className="capitalize border"
          >
            {category.name}
          </Badge>
        ))}
      </div>
    ),
  },
  { key: 'phone', header: 'Customer Phone' },
  { key: 'quantity', header: 'Waste Quantity' },
];


interface ScheduleTableProps {
  data: ScheduleItem[];
  emptyMessage: string;
}

const ScheduleTable = ({ data, emptyMessage }: ScheduleTableProps) => {

  const tableState = useDataTable({
    data,
    searchableFields: ['id', 'scheduleCreator', 'address', 'phone'],
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
  const [scheduleType, setScheduleType] =  useState("pending")
  const [schedules, setSchedules] = useState([])
  
  const { data: pendingpickupData, isLoading } = useGetPickupByStatusQuery(scheduleType);

  useEffect(()=>{
    setScheduleType(mainTab)
  },[mainTab])

  useEffect(()=>{
    if(pendingpickupData){
      setSchedules(pendingpickupData.data.data)  
    }
  },[pendingpickupData])


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
              <ScheduleTable data={schedules} emptyMessage="No pending schedules from Household App" />
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
              <ScheduleTable data={schedules} emptyMessage="No missed schedules from Household App" />
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
              <ScheduleTable data={schedules} emptyMessage="No completed schedules from Household App" />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulePage;
