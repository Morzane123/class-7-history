"use client";

import { useState, useEffect } from "react";
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
  is_class7: number;
  class_name: string | null;
  approved: number;
  email_verified: number;
  created_at: string;
}

interface AdminTabsProps {
  sections: Section[];
  users: User[];
  currentUserRole: number;
}

export default function AdminTabs({ sections: initialSections, users: initialUsers, currentUserRole }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<"sections" | "users" | "pending">("pending");
  const [sections, setSections] = useState(initialSections);
  const [users, setUsers] = useState(initialUsers);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);

  const [newSection, setNewSection] = useState({ name: "", description: "" });
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingUsers();
    }
  }, [activeTab]);

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch("/api/admin/pending");
      const data = await res.json();
      if (res.ok) {
        setPendingUsers(data.users);
      }
    } catch {
      console.error("获取待审核用户失败");
    }
  };

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
    if (!confirm(`确定要将该用户权限修改为 ${newRole === 0 ? "访客" : newRole === 1 ? "普通用户" : newRole === 2 ? "管理员" : "超级管理员"} 吗？`)) return;

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

  const handleApproveUser = async (userId: string) => {
    if (!confirm("确定要通过此用户的审核吗？")) return;

    try {
      const res = await fetch(`/api/admin/pending/${userId}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
      }
    } catch {
      alert("审核失败");
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!confirm("确定要拒绝此用户的注册申请吗？")) return;

    try {
      const res = await fetch(`/api/admin/pending/${userId}/reject`, {
        method: "POST",
      });

      if (res.ok) {
        setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
      }
    } catch {
      alert("拒绝失败");
    }
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case 0: return "访客";
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
          onClick={() => setActiveTab("pending")}
          className={`relative px-6 py-3 rounded-xl font-medium transition-colors ${
            activeTab === "pending"
              ? "bg-[#0071e3] text-white"
              : "bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
          }`}
        >
          待审核
          {pendingUsers.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#ff3b30] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {pendingUsers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("sections")}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            activeTab === "sections"
              ? "bg-[#0071e3] text-white"
              : "bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
          }`}
        >
          板块管理
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            activeTab === "users"
              ? "bg-[#0071e3] text-white"
              : "bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
          }`}
        >
          用户管理
        </button>
      </div>

      {activeTab === "pending" && (
        <div className="bg-white rounded-2xl shadow-[rgba(0,0,0,0.08)_0px_2px_8px] overflow-hidden">
          {pendingUsers.length === 0 ? (
            <div className="p-8 text-center text-[#6e6e73]">
              暂无待审核用户
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#f5f5f7]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">用户</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">邮箱</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">身份</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">注册时间</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-[#1d1d1f]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d2d2d7]">
                {pendingUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar || "/default-avatar.png"} 
                          alt="" 
                          className="w-8 h-8 rounded-full object-cover" 
                        />
                        <span className="text-[#1d1d1f]">{user.nickname}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#6e6e73]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        user.is_class7 === 1 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {user.is_class7 === 1 ? "七班" : user.class_name || "外班"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6e6e73]">
                      {new Date(user.created_at).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleApproveUser(user.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2"
                      >
                        通过
                      </button>
                      <button
                        onClick={() => handleRejectUser(user.id)}
                        className="px-4 py-2 bg-[#ff3b30] text-white rounded-lg hover:bg-red-600"
                      >
                        拒绝
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "sections" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-[rgba(0,0,0,0.08)_0px_2px_8px]">
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">添加新板块</h2>
            <form onSubmit={handleCreateSection} className="flex gap-4">
              <input
                type="text"
                value={newSection.name}
                onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                placeholder="板块名称"
                className="input-field flex-1"
                required
              />
              <input
                type="text"
                value={newSection.description}
                onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                placeholder="板块描述"
                className="input-field flex-1"
              />
              <button
                type="submit"
                className="bg-[#0071e3] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#0062cc] transition-colors"
              >
                添加
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-[rgba(0,0,0,0.08)_0px_2px_8px] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f5f5f7]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">名称</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">描述</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">排序</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-[#1d1d1f]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d2d2d7]">
                {sections.map((section) => (
                  <tr key={section.id}>
                    <td className="px-6 py-4">
                      {editingSection?.id === section.id ? (
                        <input
                          type="text"
                          value={editingSection.name}
                          onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                          className="input-field"
                        />
                      ) : (
                        <span className="text-[#1d1d1f]">{section.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingSection?.id === section.id ? (
                        <input
                          type="text"
                          value={editingSection.description || ""}
                          onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                          className="input-field"
                        />
                      ) : (
                        <span className="text-[#6e6e73]">{section.description}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#6e6e73]">{section.sort_order}</td>
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
                            className="px-4 py-2 bg-[#f5f5f7] text-[#1d1d1f] rounded-lg hover:bg-[#e8e8ed]"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingSection(section)}
                            className="px-4 py-2 text-[#0071e3] hover:bg-[#0071e3]/10 rounded-lg"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="px-4 py-2 text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-lg"
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
        <div className="bg-white rounded-2xl shadow-[rgba(0,0,0,0.08)_0px_2px_8px] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f5f5f7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">用户</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">邮箱</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">身份</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">权限</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">状态</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#1d1d1f]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d2d2d7]">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar || "/default-avatar.png"} 
                        alt="" 
                        className="w-8 h-8 rounded-full object-cover" 
                      />
                      <div>
                        <span className="text-[#1d1d1f]">{user.nickname}</span>
                        {user.is_class7 === 0 && user.class_name && (
                          <span className="text-xs text-[#6e6e73] ml-1">({user.class_name})</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#6e6e73]">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user.is_class7 === 1 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {user.is_class7 === 1 ? "七班" : "外班"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user.role === 3 ? "bg-purple-100 text-purple-700" :
                      user.role === 2 ? "bg-blue-100 text-blue-700" :
                      user.role === 1 ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {user.approved ? "已审核" : "待审核"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {currentUserRole >= 3 && user.role < 3 && (
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user.id, parseInt(e.target.value))}
                        className="px-3 py-2 border border-[#d2d2d7] rounded-lg text-sm bg-white"
                      >
                        <option value={0}>访客</option>
                        <option value={1}>普通用户</option>
                        <option value={2}>管理员</option>
                        <option value={3}>超级管理员</option>
                      </select>
                    )}
                    {currentUserRole >= 2 && user.role < currentUserRole && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="ml-2 px-4 py-2 text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-lg"
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
