import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useUserPlan } from '@/hooks/useUserPlan';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Heart, Zap, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface DailyUsage {
  date: string;
  openers_generated: number;
  favorites_count: number;
}

const Statistics = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  const { plan, loading: planLoading } = useUserPlan();
  const { usage, loading: usageLoading } = useUsageTracking();
  const [historicalData, setHistoricalData] = useState<DailyUsage[]>([]);
  const [totalStats, setTotalStats] = useState({ totalOpeners: 0, totalFavorites: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!user) return;

      try {
        // Fetch last 30 days of usage data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from('user_usage')
          .select('date, openers_generated, favorites_count')
          .eq('user_id', user.id)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) throw error;

        setHistoricalData(data || []);

        // Calculate total stats from all time
        const { data: allTimeData, error: allTimeError } = await supabase
          .from('user_usage')
          .select('openers_generated, favorites_count')
          .eq('user_id', user.id);

        if (allTimeError) throw allTimeError;

        const totals = (allTimeData || []).reduce(
          (acc, curr) => ({
            totalOpeners: acc.totalOpeners + curr.openers_generated,
            totalFavorites: acc.totalFavorites + curr.favorites_count,
          }),
          { totalOpeners: 0, totalFavorites: 0 }
        );

        setTotalStats(totals);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchHistoricalData();
  }, [user]);

  // Calculate plan limits
  const openerLimit = plan === 'free' ? 5 : 999;
  const favoriteLimit = plan === 'free' ? 5 : 999;
  const openerProgress = plan === 'free' ? (usage.openers_generated / openerLimit) * 100 : 0;
  const favoriteProgress = plan === 'free' ? (usage.favorites_count / favoriteLimit) * 100 : 0;

  // Format data for charts
  const chartData = historicalData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    openers: item.openers_generated,
    favorites: item.favorites_count,
  }));

  const loading = planLoading || usageLoading || dataLoading;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl font-heading font-bold text-foreground flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          Usage Statistics
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your conversation generation activity and progress
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Total Openers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalStats.totalOpeners}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Total Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalStats.totalFavorites}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today's Openers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{usage.openers_generated}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {plan === 'free' ? `${openerLimit - usage.openers_generated} remaining` : 'Unlimited'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground capitalize">{plan}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {plan === 'free' ? 'Limited features' : 'All features unlocked'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Limits Progress */}
      {plan === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Daily Limits</CardTitle>
              <CardDescription>Your usage against free plan limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Openers Generated Today</span>
                  <span className="text-muted-foreground">
                    {usage.openers_generated} / {openerLimit}
                  </span>
                </div>
                <Progress value={openerProgress} className="h-2" />
                {usage.hasExceededOpenerLimit && (
                  <p className="text-xs text-destructive">Daily limit reached. Upgrade for unlimited openers!</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Favorites Saved</span>
                  <span className="text-muted-foreground">
                    {usage.favorites_count} / {favoriteLimit}
                  </span>
                </div>
                <Progress value={favoriteProgress} className="h-2" />
                {usage.hasExceededFavoriteLimit && (
                  <p className="text-xs text-destructive">Favorite limit reached. Upgrade for unlimited favorites!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Activity Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Activity Trends</CardTitle>
            <CardDescription>Your generation activity over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="openers" 
                    name="Openers Generated"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="favorites" 
                    name="Favorites Saved"
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <Calendar className="w-12 h-12 mx-auto opacity-50" />
                  <p>No activity data yet. Start generating openers to see your trends!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Distribution Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Daily Distribution</CardTitle>
              <CardDescription>Breakdown of your daily activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="openers" 
                    name="Openers"
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="favorites" 
                    name="Favorites"
                    fill="hsl(var(--accent))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Statistics;
