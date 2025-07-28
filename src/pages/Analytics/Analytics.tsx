import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/state/store";
import {
  fetchAllAnalytics,
  fetchAnalyticsByDate,
  deleteAnalytics,
} from "@/state/slices/analyticsSlice";

const Analytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    analyticsList,
    selectedAnalytics,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.analytics);

  const currentUser = useSelector((state: RootState) => state.auth.user); // Optional, if filtering by user

  useEffect(() => {
    dispatch(fetchAllAnalytics());
  }, [dispatch]);

  const handleFetchByDate = (date: string) => {
    dispatch(fetchAnalyticsByDate(date));
  };

  const handleDelete = (date: string) => {
    dispatch(deleteAnalytics(date));
  };

  // Optional: filter analytics by logged-in user
  const filteredAnalytics = analyticsList.filter(
    (item: any) => !item._id || item._id === currentUser?._id // adjust key if needed
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Analytics Dashboard</h1>

      {isLoading && <p>Loading analytics...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <p>Showing real-time analytics data based on user activity.</p>

      <h2>All Analytics Records</h2>
      {filteredAnalytics.length === 0 && <p>No analytics data found.</p>}

      {filteredAnalytics.map((item:any) => (
        <div
          key={item.date}
          style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}
        >
          <p><strong>Date:</strong> {item.date}</p>
          <p><strong>Total Users:</strong> {item.users.total}</p>
          <p><strong>Roadmap Views:</strong> {item.roadmaps.views}</p>
          <p><strong>Resource Clicks:</strong> {item.resources.clicks}</p>
          <button onClick={() => handleFetchByDate(item.date)}>View Details</button>
          <button
            onClick={() => handleDelete(item.date)}
            style={{ marginLeft: "10px", color: "red" }}
          >
            Delete
          </button>
        </div>
      ))}

      {selectedAnalytics && (
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            border: "2px solid #333",
            background: "#f9f9f9",
          }}
        >
          <h2>📅 Selected Analytics — {selectedAnalytics.date}</h2>

          <h3>👥 Users</h3>
          <ul>
            <li>Total: {selectedAnalytics.users.total}</li>
            <li>New: {selectedAnalytics.users.new}</li>
            <li>Active: {selectedAnalytics.users.active}</li>
          </ul>

          <h3>📈 Roadmaps</h3>
          <p>Views: {selectedAnalytics.roadmaps.views}</p>
          <p>Top Viewed:</p>
          <ul>
            {selectedAnalytics.roadmaps.topViewed.map((item: any) => (
              <li key={item.roadmap}>
                {item.roadmap} - {item.views} views
              </li>
            ))}
          </ul>
          <p>Top Completed:</p>
          <ul>
            {selectedAnalytics.roadmaps.topCompleted.map((item: any) => (
              <li key={item.roadmap}>
                {item.roadmap} - {item.completions} completions
              </li>
            ))}
          </ul>

          <h3>📚 Resources</h3>
          <p>Clicks: {selectedAnalytics.resources.clicks}</p>
          <ul>
            {selectedAnalytics.resources.topClicked.map((res: any) => (
              <li key={res.resource}>
                {res.resource} - {res.clicks} clicks
              </li>
            ))}
          </ul>

          <h3>📊 Engagement</h3>
          <ul>
            <li>Avg. Session Duration: {selectedAnalytics.engagement.averageSessionDuration}s</li>
            <li>Pages/Session: {selectedAnalytics.engagement.pagesPerSession}</li>
            <li>Bounce Rate: {selectedAnalytics.engagement.bounceRate}%</li>
          </ul>

          <h3>💻 Devices</h3>
          <ul>
            <li>Desktop: {selectedAnalytics.devices.desktop}%</li>
            <li>Mobile: {selectedAnalytics.devices.mobile}%</li>
            <li>Tablet: {selectedAnalytics.devices.tablet}%</li>
          </ul>

          <h3>🌍 Locations</h3>
          <ul>
            {selectedAnalytics.locations.map((loc: any, index:any) => (
              <li key={index}>
                {loc.country || "Unknown"} - {loc.users} users
              </li>
            ))}
          </ul>

          <h3>🔗 Referrers</h3>
          <ul>
            {selectedAnalytics.referrers.map((ref:any, index:any) => (
              <li key={index}>
                {ref.source || "Direct"} - {ref.count}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Analytics;
