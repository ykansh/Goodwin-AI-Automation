import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { TrendingUp, Users, Flame, CheckCircle, UserCircle, CreditCard, DollarSign } from 'lucide-react';

export const MarketingDashboard = () => {
  const [revenuePeriod, setRevenuePeriod] = useState('monthly');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* 6 Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Revenue */}
        <Card className="hover:shadow-level-2 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary-light uppercase tracking-wider">
              Revenue
            </CardTitle>
            <Select 
              value={revenuePeriod} 
              onChange={(e) => setRevenuePeriod(e.target.value)}
              className="w-28 h-8 text-xs bg-canvas"
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-display text-secondary-dark tracking-tight">
                  {revenuePeriod === 'monthly' ? '$142,300' : revenuePeriod === 'weekly' ? '$34,500' : '$5,200'}
                </div>
                <p className="text-xs text-primary font-medium flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" /> +12.5% vs last {revenuePeriod.replace('ly', '')}
                </p>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Leads in Pipeline */}
        <Card className="hover:shadow-level-2 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary-light uppercase tracking-wider">
              Pipeline Leads
            </CardTitle>
            <Users className="h-4 w-4 text-secondary-light" />
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-display text-secondary-dark tracking-tight">842</div>
                <p className="text-xs text-secondary-light font-medium mt-1">Across 12 campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Hot Leads */}
        <Card className="hover:shadow-level-2 transition-shadow border-tertiary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary-light uppercase tracking-wider">
              Hot Leads
            </CardTitle>
            <div className="h-6 w-6 bg-tertiary/20 rounded flex items-center justify-center">
              <Flame className="h-4 w-4 text-tertiary-dark" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-display text-secondary-dark tracking-tight">47</div>
                <p className="text-xs text-tertiary-dark font-medium flex items-center mt-1">
                  Requires immediate action
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Tasks Due Today */}
        <Card className="hover:shadow-level-2 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary-light uppercase tracking-wider">
              Tasks Due Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-secondary-light" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-display text-secondary-dark tracking-tight">12</div>
                <p className="text-xs text-warning font-medium mt-1">5 High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Team Members */}
        <Card className="hover:shadow-level-2 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary-light uppercase tracking-wider">
              Active Team
            </CardTitle>
            <UserCircle className="h-4 w-4 text-secondary-light" />
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-display text-secondary-dark tracking-tight">24</div>
                <p className="text-xs text-secondary-light font-medium mt-1">3 currently online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. Total Expenses */}
        <Card className="hover:shadow-level-2 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary-light uppercase tracking-wider">
              Total Expenses
            </CardTitle>
            <CreditCard className="h-4 w-4 text-secondary-light" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-display text-secondary-dark tracking-tight">$42,150</div>
                <p className="text-xs text-secondary-light font-medium mt-1">Monthly aggregate</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
