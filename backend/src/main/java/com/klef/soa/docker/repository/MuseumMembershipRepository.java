package com.klef.soa.docker.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klef.soa.docker.entity.MuseumMembership;

public interface MuseumMembershipRepository extends JpaRepository<MuseumMembership, Long> {
}
