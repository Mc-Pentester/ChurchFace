"use client";

import UserSearch from "@/components/friends/UserSearch";
import FriendRequestsList from "@/components/friends/FriendRequestsList";
import FriendsList from "@/components/friends/FriendsList";

export default function FriendsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Amis</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-1">
          <UserSearch />
        </div>

        <div className="md:col-span-1">
          <FriendRequestsList />
        </div>

        <div className="md:col-span-1">
          <FriendsList />
        </div>
      </div>
    </div>
  );
}
