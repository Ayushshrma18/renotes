
import { useEffect, useState } from "react";
import { getUserProfile, type UserProfile, getNotes } from "@/lib/storage";

const Streak = () => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [pointsHistory, setPointsHistory] = useState<{ date: string; points: number }[]>([]);

  useEffect(() => {
    // Get notes with points and group by date
    const notes = getNotes()
      .filter((note) => note.points && !note.deletedAt)
      .map((note) => ({
        date: new Date(note.date).toLocaleDateString(),
        points: note.points || 0,
      }))
      .reduce((acc, { date, points }) => {
        acc[date] = (acc[date] || 0) + points;
        return acc;
      }, {} as Record<string, number>);

    const history = Object.entries(notes).map(([date, points]) => ({ date, points }));
    setPointsHistory(history);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Writing Streak</h2>
      <div className="glass-card p-6 rounded-lg">
        <div className="text-4xl font-bold mb-2">{profile.streak} Days</div>
        <p className="text-muted-foreground">Current writing streak</p>
      </div>

      <h3 className="text-xl font-semibold mt-8">Points History</h3>
      <div className="space-y-4">
        {pointsHistory.map(({ date, points }) => (
          <div key={date} className="glass-card p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{date}</span>
              <span className="font-semibold">+{points} points</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Streak;
