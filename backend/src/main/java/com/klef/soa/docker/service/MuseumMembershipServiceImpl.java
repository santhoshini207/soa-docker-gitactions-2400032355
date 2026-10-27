package com.klef.soa.docker.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.klef.soa.docker.entity.MuseumMembership;
import com.klef.soa.docker.repository.MuseumMembershipRepository;

@Service
public class MuseumMembershipServiceImpl implements MuseumMembershipService {

	private final MuseumMembershipRepository repository;

	public MuseumMembershipServiceImpl(MuseumMembershipRepository repository) {
		this.repository = repository;
	}

	@Override
	public MuseumMembership createMembership(MuseumMembership membership) {
		membership.setId(null);
		return repository.save(membership);
	}

	@Override
	public List<MuseumMembership> getAllMemberships() {
		return repository.findAll(Sort.by(Sort.Direction.DESC, "id"));
	}

	@Override
	public Optional<MuseumMembership> getMembershipById(Long id) {
		return repository.findById(id);
	}

	@Override
	public Optional<MuseumMembership> updateMembership(Long id, MuseumMembership request) {
		return repository.findById(id).map(membership -> {
			membership.setMemberName(request.getMemberName());
			membership.setMembershipType(request.getMembershipType());
			membership.setStartDate(request.getStartDate());
			membership.setAnnualFee(request.getAnnualFee());
			return repository.save(membership);
		});
	}

	@Override
	public boolean deleteMembership(Long id) {
		if (!repository.existsById(id)) {
			return false;
		}
		repository.deleteById(id);
		return true;
	}
}
