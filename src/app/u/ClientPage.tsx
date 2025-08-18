'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { storageService } from '@/lib/storage';
import { Dashboard } from '@/components/Dashboard';
import { ProjectEditor } from '@/components/ProjectEditor';
import { SharedProjectView } from '@/components/SharedProjectView';
import { AccessScreen } from '@/components/AccessScreen';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { SharedLink } from '@/types';

type View = 'access' | 'dashboard' | 'editor' | 'shared';

export default function ClientPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('access');
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [sharedAccessData, setSharedAccessData] = useState<{
    projectId: string;
    accessType: 'view' | 'edit';
  } | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check for shared link access
      const urlParams = new URLSearchParams(window.location.search);
      let shareToken = urlParams.get('share');
      // Support short path variant /u/:token
      if (!shareToken) {
        const pathMatch = window.location.pathname.match(/\/u\/(.+)$/);
        if (pathMatch) {
          const candidate = decodeURIComponent(pathMatch[1]);
          // Only accept URL-safe short tokens
          if (/^[0-9A-Za-z_-]{3,64}$/.test(candidate)) {
            shareToken = candidate;
          }
        }
      }
      
      if (shareToken) {
        try {
          // Try server-stored map first
          const sharedLinks: Record<string, SharedLink> = await storageService.getSharedLinks();
          let linkData: SharedLink | undefined = sharedLinks[shareToken];

          // Fallback: decode stateless token (base64url JSON)
          if (!linkData) {
            const decoded = decodeStatelessToken(shareToken);
            if (decoded) linkData = decoded;
          }

          if (linkData && new Date() < new Date(linkData.expiresAt)) {
            setSharedAccessData({
              projectId: linkData.projectId,
              accessType: linkData.accessType
            });
            setCurrentView('shared');
            setCurrentProject(linkData.projectId);
          } else {
            toast.error('Invalid or expired share link');
            setCurrentView('access');
          }
        } catch (error) {
          toast.error('Error processing share link', {
            description: 'There was an error processing the share link'
          });
          setCurrentView('access');
        }
      } else {
        // Check for existing authentication
        const auth = localStorage.getItem('pacify_auth');
        if (auth === 'true') {
          setIsAuthenticated(true);
          setCurrentView('dashboard');
        }
      }
    } catch (error) {
      // Handle initialization error
    } finally {
      setIsLoading(false);
    }
  };

  function decodeStatelessToken(token: string): SharedLink | null {
    try {
      const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(escape(atob(base64)));
      const payload: unknown = JSON.parse(json);
      if (
        payload &&
        typeof payload === 'object' &&
        'projectId' in payload &&
        'expiresAt' in payload &&
        'accessType' in payload &&
        (payload as { accessType: string }).accessType &&
        ((payload as { accessType: string }).accessType === 'view' || (payload as { accessType: string }).accessType === 'edit')
      ) {
        const { projectId, accessType, createdAt, expiresAt, projectName } = payload as SharedLink;
        return { projectId, accessType, createdAt, expiresAt, projectName };
      }
      return null;
    } catch {
      return null;
    }
  }

  const handleLogin = () => {
    try {
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      localStorage.setItem('pacify_auth', 'true');
      toast.success('Welcome to Doc0', {
        description: 'You are now authenticated and can manage your documentation projects'
      });
    } catch (error) {
      toast.error('Login failed', {
        description: 'There was an error during authentication'
      });
    }
  };

  const handleLogout = () => {
    try {
      setIsAuthenticated(false);
      setCurrentView('dashboard');
      setCurrentProject(null);
      localStorage.removeItem('pacify_auth');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const openProject = (projectId: string) => {
    try {
      setCurrentProject(projectId);
      setCurrentView('editor');
    } catch (error) {
      toast.error('Failed to open project', {
        description: 'There was an error opening the project'
      });
    }
  };

  const backToDashboard = () => {
    try {
      setCurrentView('dashboard');
      setCurrentProject(null);
      // Clean up URL if we came from a shared link
      if (window.location.search.includes('share=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      toast.error('Navigation error', {
        description: 'There was an error navigating back'
      });
    }
  };

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Shared link access
  if (sharedAccessData && currentView === 'shared') {
    return (
      <SharedProjectView 
        projectId={currentProject!}
        accessType={sharedAccessData.accessType}
        onBack={() => {
          // Go to homepage instead of trying to access dashboard
          window.location.href = window.location.origin;
        }}
      />
    );
  }

  // Owner access
  if (!isAuthenticated) {
    return <AccessScreen onLogin={handleLogin} />;
  }

  // Main application
  return (
    <div className="min-h-screen bg-background">
      {currentView === 'dashboard' && (
        <Dashboard
          onOpenProject={openProject}
          onLogout={handleLogout}
        />
      )}
      
      {currentView === 'editor' && currentProject && (
        <ProjectEditor
          projectId={currentProject}
          onBack={backToDashboard}
        />
      )}
    </div>
  );
}


