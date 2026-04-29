"use client";

import { apiClient } from "@/app/lib/apiClient";
import { transformTeams } from "@/app/lib/util";
import { Role, Team, User } from "@/app/types";
import { useTransition } from "react";

interface AdminDashboardProps {
  users: User[];
  teams: Team[];
  currentUser: User;
}

function AdminDashboard({ users, teams, currentUser }: AdminDashboardProps) {
  const [isPending, startTransition] = useTransition();

  const handleTeamAssignment = async (
    userId: string,
    teamId: string | null,
  ) => {
    startTransition(async () => {
      try {
        await apiClient.assignUserToTeam(userId, teamId);
        window.location.reload();
        //Use router.refresh() becaus it is not loading the whole page, jus the data
      } catch (error) {
        console.log(error);
        alert(
          error instanceof Error
            ? error.message
            : "Error updating team assignment",
        );
      }
    });
  };

  const handleRoleAssignment = async (userId: string, newrole: Role) => {
    if (userId === currentUser.id) {
      alert("You cannot change your own role");
      return;
    }
    try {
      startTransition(async () => {
        try {
          await apiClient.updateUserRole(userId, newrole);
          window.location.reload();
          //Use router.refresh() becaus it is not loading the whole page, jus the data
        } catch (error) {
          console.log(error);
          alert(
            error instanceof Error
              ? error.message
              : "Error updating team assignment",
          );
        }
      });
    } catch (error) {
      console.log(error);
      alert(
        error instanceof Error
          ? error.message
          : "Error updating role assignment",
      );
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-white">Admin Dashboard</h1>
        <p className="text-slate-300">User and team management</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {/* USER TABLE WITH ROLE AND TEAM ASSIGNMENT */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-4 border-b border-slate-700">
            <h3 className="font-semibold text-white">User ({users.length})</h3>
            <p className="text-slate-400 text-sm">
              Manage user roles and team assignments
            </p>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-300">Name</th>
                  <th className="text-left text-slate-300">Role</th>
                  <th className="text-left text-slate-300">Team</th>
                  <th className="text-left text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700">
                    <td className="py-2 text-slate-300">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div>{user.name}</div>
                          <div className="text-slate-500 text-xs">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleAssignment(user.id, e.target.value as Role)
                        }
                        disabled={user.id === currentUser.id}
                        className="bg-slate-900 border py-1 border-slate-700 rounded-lg"
                      >
                        <option value={Role.USER}>USER</option>
                        <option value={Role.ADMIN}>ADMIN</option>
                        <option value={Role.MANAGER}>MANAGER</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <select
                        value={user.teamId || ""}
                        onChange={(e) =>
                          handleTeamAssignment(user.id, e.target.value || null)
                        }
                        disabled={isPending}
                        className="bg-slate-900 border py-1 border-slate-700 rounded-lg"
                      >
                        <option value={""}>No Team</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                      {user.team && (
                        <span className="text-xs text-slate-500">
                          {user.team.code}
                        </span>
                      )}
                    </td>
                    <td className="py-2">
                      {user.teamId && (
                        <button
                          onClick={() => handleTeamAssignment(user.id, null)}
                          disabled={isPending}
                          className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TEAMS TABLE */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-4 border-b border-slate-700">
            <h3 className="font-semibold text-white">
              Teams ({transformTeams.length})
            </h3>
            <p className="text-slate-400 text-sm">Team overview</p>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-300">Name</th>
                  <th className="text-left text-slate-300">Code</th>
                  <th className="text-left text-slate-300">Members</th>
                  <th className="text-left text-slate-300">Managers</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => {
                  const teamMembers = users.filter(
                    (user) => user.teamId === team.id,
                  );

                  const teamManagers = teamMembers.filter(
                    (user) => user.role === Role.MANAGER,
                  );
                  return (
                    <tr key={team.id} className="border-b border-slate-700">
                      <td className="py-2 text-slate-300 font-medium">
                        {team.name}
                      </td>
                      <td className="py-2 ">
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                          {team.code}
                        </span>
                      </td>
                      <td className="py-2 text-slate-300 ">
                        {teamMembers.length} Users
                      </td>
                      <td className="py-2 text-slate-300 ">
                        {teamManagers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {teamManagers.map((manager) => (
                              <span
                                key={manager.id}
                                className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm"
                              >
                                {manager.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-slate-300 text-xs">
                            No manager
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{users.length}</div>
          <div className="text-sm text-slate-400">Total Users</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          {users.filter((user) => user.role === Role.ADMIN).length}
          <div className="text-2xl font-bold text-white"></div>
          <div className="text-sm text-slate-400">Admins</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{users.length}</div>
          <div className="text-sm text-slate-400">Managers</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-sm text-slate-400">Users</div>
          <div className="text-2xl font-bold text-white">
            {users.filter((user) => user.role === Role.MANAGER).length}
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {users.filter((user) => user.role === Role.USER).length}
          </div>
          <div className="text-sm text-slate-400">Teams</div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
