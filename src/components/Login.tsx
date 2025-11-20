import { useState } from 'react'
import type { User } from '../types'
import { ROLE_LABELS } from '../types'
import './Login.css'

interface LoginProps {
  users: User[]
  onLogin: (user: User) => void
  onAddUser: (name: string, role: 'teacher' | 'staff' | 'admin') => void
}

export default function Login({ users, onLogin, onAddUser }: LoginProps) {
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState<'teacher' | 'staff' | 'admin'>('teacher')

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (newUserName.trim()) {
      onAddUser(newUserName.trim(), newUserRole)
      setNewUserName('')
      setShowAddUser(false)
    }
  }

  const teacherUsers = users.filter(u => u.role === 'teacher')
  const staffUsers = users.filter(u => u.role === 'staff')
  const adminUsers = users.filter(u => u.role === 'admin')

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">⏱️ 학원 업무 시간 추적기</h1>
        <p className="login-subtitle">사용자를 선택하여 시작하세요</p>

        {!showAddUser ? (
          <>
            <div className="user-sections">
              {adminUsers.length > 0 && (
                <div className="user-section">
                  <h3 className="section-title">👔 관리자</h3>
                  <div className="user-grid">
                    {adminUsers.map(user => (
                      <button
                        key={user.id}
                        className="user-btn admin"
                        onClick={() => onLogin(user)}
                      >
                        <div className="user-icon">👔</div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-role">{ROLE_LABELS[user.role]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {teacherUsers.length > 0 && (
                <div className="user-section">
                  <h3 className="section-title">👨‍🏫 강사</h3>
                  <div className="user-grid">
                    {teacherUsers.map(user => (
                      <button
                        key={user.id}
                        className="user-btn teacher"
                        onClick={() => onLogin(user)}
                      >
                        <div className="user-icon">👨‍🏫</div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-role">{ROLE_LABELS[user.role]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {staffUsers.length > 0 && (
                <div className="user-section">
                  <h3 className="section-title">💼 운영팀</h3>
                  <div className="user-grid">
                    {staffUsers.map(user => (
                      <button
                        key={user.id}
                        className="user-btn staff"
                        onClick={() => onLogin(user)}
                      >
                        <div className="user-icon">💼</div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-role">{ROLE_LABELS[user.role]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className="add-user-toggle"
              onClick={() => setShowAddUser(true)}
            >
              + 새 사용자 추가
            </button>
          </>
        ) : (
          <form onSubmit={handleAddUser} className="add-user-form">
            <h3>새 사용자 추가</h3>

            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="이름을 입력하세요"
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label>역할</label>
              <div className="role-selector">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={newUserRole === 'teacher'}
                    onChange={(e) => setNewUserRole(e.target.value as 'teacher')}
                  />
                  <span>👨‍🏫 강사</span>
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="staff"
                    checked={newUserRole === 'staff'}
                    onChange={(e) => setNewUserRole(e.target.value as 'staff')}
                  />
                  <span>💼 운영팀</span>
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={newUserRole === 'admin'}
                    onChange={(e) => setNewUserRole(e.target.value as 'admin')}
                  />
                  <span>👔 관리자</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                추가하기
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowAddUser(false)
                  setNewUserName('')
                }}
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
