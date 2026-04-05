"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Section {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string | null;
  role: number;
  email_verified: number;
  created_at: string;
}

interface AdminTabsProps {
  sections: Section[];
  users: User[];
  currentUserRole: number;
}

export default function AdminTabs({ sections: initialSections, users: initialUsers, currentUserRole }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<"sections" | "users">("sections");
  const [sections, setSections] = useState(initialSections);
  const [users, setUsers] = useState(initialUsers);

  const [newSection, setNewSection] = useState({ name: "", description: "" });
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: uuidv4(),
          name: newSection.name,
          description: newSection.description,
          sort_order: sections.length + 1,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSections([...sections, data.section]);
        setNewSection({ name: "", description: "" });
      }
    } catch {
      alert("创建失败");
    }
  };

  const handleUpdateSection = async (section: Section) => {
    try {
      const res = await fetch(`/api/admin/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(section),
      });

      if (res.ok) {
        setSections(sections.map((s) => (s.id === section.id ? section : s)));
        setEditingSection(null);
      }
    } catch {
      alert("更新失败");
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("确定要删除此板块吗？")) return;

    try {
      const res = await fetch(`/api/admin/sections/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSections(sections.filter((s) => s.id !== id));
      }
    } catch {
      alert("删除失败");
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: number) => {
    if (!confirm(`确定要将该用户权限修改为 ${newRole === 1 ? "普通用户" : newRole === 2 ? "管理员" : "超级管理员"} 吗？`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      }
    } catch {
      alert("更新失败");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("确定要删除此用户吗？")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch {
      alert("删除失败");
    }
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case 1: return "普通用户";
      case 2: return "管理员";
      case 3: return "超级管理员";
      default: return "未知";
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("sections")}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === "sections"
              ? "bg-app-blue text-white"
              : "bg-white text-app-text hover:bg-gray-100"
          }`}
        >
          板块管理
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === "users"
              ? "bg-app-blue text-white"
              : "bg-white text-app-text hover:bg-gray-100"
          }`}
        >
          用户管理
        </button>
      </div>

      {activeTab === "sections" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="text-xl font-semibold text-app-text mb-4">添加新板块</h2>
            <form onSubmit={handleCreateSection} className="flex gap-4">
              <input
                type="text"
                value={newSection.name}
                onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                placeholder="板块名称"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-blue"
                required
              />
              <input
                type="text"
                value={newSection.description}
                onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                placeholder="板块描述"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-blue"
              />
              <button
                type="submit"
                className="bg-app-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                添加
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-app-gray">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-app-text">名称</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-app-text">描述</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-app-text">排序</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-app-text">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sections.map((section) => (
                  <tr key={section.id}>
                    <td className="px-6 py-4">
                      {editingSection?.id === section.id ? (
                        <input
                          type="text"
                          value={editingSection.name}
                          onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                          className="px-3 py-2 border border-gray-200 rounded-lg w-full"
                        />
                      ) : (
                        <span className="text-app-text">{section.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingSection?.id === section.id ? (
                        <input
                          type="text"
                          value={editingSection.description || ""}
                          onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                          className="px-3 py-2 border border-gray-200 rounded-lg w-full"
                        />
                      ) : (
                        <span className="text-gray-500">{section.description}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{section.sort_order}</td>
                    <td className="px-6 py-4 text-right">
                      {editingSection?.id === section.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateSection(editingSection)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingSection(null)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingSection(section)}
                            className="px-4 py-2 text-app-blue hover:bg-blue-50 rounded-lg"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            删除
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-app-gray">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app-text">用户</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app-text">邮箱</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app-text">权限</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app-text">状态</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app-text">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-app-blue flex items-center justify-center text-white text-sm">
                          {user.nickname.charAt(0)}
                        </div>
                      )}
                      <span className="text-app-text">{user.nickname}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user.role === 3 ? "bg-purple-100 text-purple-700" :
                      user.role === 2 ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user.email_verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {user.email_verified ? "已验证" : "未验证"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {currentUserRole >= 3 && user.role < 3 && (
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user.id, parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value={1}>普通用户</option>
                        <option value={2}>管理员</option>
                        <option value={3}>超级管理员</option>
                      </select>
                    )}
                    {currentUserRole >= 2 && user.role < currentUserRole && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="ml-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
