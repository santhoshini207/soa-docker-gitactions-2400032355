package com.klef.soa.docker.service;

import java.util.List;
import java.util.Optional;

import com.klef.soa.docker.entity.MuseumMembership;

public interface MuseumMembershipService {

	MuseumMembership createMembership(MuseumMembership membership);

	List<MuseumMembership> getAllMemberships();

	Optional<MuseumMembership> getMembershipById(Long id);

	Optional<MuseumMembership> updateMembership(Long id, MuseumMembership membership);

	boolean deleteMembership(Long id);
}
