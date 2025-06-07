'use client';

import { useRole } from '@/app/hooks/useRole';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PropTypes from 'prop-types';

export default function RoleGuard({ children, allowedRoles = [] }) {
  const { role, user } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!allowedRoles.includes(role)) {
      router.push('/unauthorized');
      return;
    }
  }, [role, user, router, allowedRoles]);

  if (!user || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}

RoleGuard.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

RoleGuard.defaultProps = {
  allowedRoles: []
}; 

