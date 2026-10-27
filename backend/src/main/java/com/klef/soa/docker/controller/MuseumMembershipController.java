package com.klef.soa.docker.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.klef.soa.docker.entity.MuseumMembership;
import com.klef.soa.docker.service.MuseumMembershipService;

@RestController
@RequestMapping("/api/memberships")
public class MuseumMembershipController {

	private final MuseumMembershipService service;

	public MuseumMembershipController(MuseumMembershipService service) {
		this.service = service;
	}

	@GetMapping
	public List<MuseumMembership> getAllMemberships() {
		return service.getAllMemberships();
	}

	@GetMapping("/{id}")
	public ResponseEntity<MuseumMembership> getMembership(@PathVariable Long id) {
		return service.getMembershipById(id)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<MuseumMembership> createMembership(@Valid @RequestBody MuseumMembership membership) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createMembership(membership));
	}

	@PutMapping("/{id}")
	public ResponseEntity<MuseumMembership> updateMembership(
			@PathVariable Long id, @Valid @RequestBody MuseumMembership membership) {
		return service.updateMembership(id, membership)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteMembership(@PathVariable Long id) {
		return service.deleteMembership(id)
				? ResponseEntity.noContent().build()
				: ResponseEntity.notFound().build();
	}
}
